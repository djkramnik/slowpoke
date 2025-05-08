#!/usr/bin/env ts-node
/**
 * slowpoke_v1.ts
 *  – loads a foundation TSV (subject[TAB]relation[TAB]object)
 *  – ingests a passage with regex heuristics
 *  – merges both into one in‑memory edge list
 *  – supports interactive Q&A:
 *        where is X?          --> located_in
 *        what color is X?     --> attr
 *        what lives in X?     --> lives_in
 *        what does the child like to do under X?
 */

import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'
import dotenv from 'dotenv'
dotenv.config()

// ─────────────────────────── types ───────────────────────────
type Edge = [string, string, string | null]

// ────────────────────────── helpers ──────────────────────────
const canon = (txt: string): string =>
  txt
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim()

const addEdge = (edges: Edge[], s: string, r: string, o: string | null) => {
  edges.push([canon(s), r, o ? canon(o) : null])
}

// ───────────────────── load foundation TSV ───────────────────
const loadFoundation = (file: string): Edge[] => {
  const edges: Edge[] = []
  const raw = fs.readFileSync(file, 'utf8')
  raw.split(/\r?\n/).forEach((line) => {
    if (!line.trim()) return
    const [s, r, o] = line.split('\t').map((t) => t.trim())
    if (s && r && o !== undefined) addEdge(edges, s, r, o)
  })
  return edges
}

// ─────────────────── naive passage ingestion ─────────────────
const P_IN_LOC = /(\b\w+\b)[^.]*\bin (?:my |the )?(\b\w+\b)/i
const P_IS_ADJ = /(\b\w+\b)\s+is\s+(?:very\s+)?(\b\w+\b)/i
const P_LIVE_IN = /(\b\w+\b)s?\s+live[s]?\s+in\s+the\s+(\b\w+\b)/i
const P_LIKE_UND =
  /(?:i|the child)\s+like[s]?\s+to\s+(\w+)\s+under\s+the\s+(\w+)/i

const ingestPassage = (text: string): Edge[] => {
  const edges: Edge[] = []
  let currentSubject: string | null = null

  const sentences = text
    .split(/[.!?]\s*/)
    .map((s) => s.trim())
    .filter(Boolean)

  for (const sent of sentences) {
    if (P_IN_LOC.test(sent)) {
      const [, subj, loc] = sent.match(P_IN_LOC)!
      currentSubject = subj
      addEdge(edges, subj, 'located_in', loc)
      continue
    }
    if (P_IS_ADJ.test(sent)) {
      const [, subj, adj] = sent.match(P_IS_ADJ)!
      currentSubject = subj
      addEdge(edges, subj, 'attr', adj)
      continue
    }
    if (currentSubject && /^it\s+is\s+/i.test(sent)) {
      const [, adj] = sent.match(/it\s+is\s+(?:very\s+)?(\w+)/i)!
      addEdge(edges, currentSubject, 'attr', adj)
      continue
    }
    if (P_LIVE_IN.test(sent)) {
      const [, creature, where] = sent.match(P_LIVE_IN)!
      addEdge(edges, creature, 'lives_in', where)
      continue
    }
    if (P_LIKE_UND.test(sent)) {
      const [, verb, obj] = sent.match(P_LIKE_UND)!
      addEdge(edges, 'child', `likes_to_${verb}_under`, obj)
      continue
    }
  }
  return edges
}

// ───────────────────── query dispatcher ──────────────────────
const answer = (edges: Edge[], q: string): string => {
  const question = q.trim().toLowerCase()

  let m: RegExpMatchArray | null

  if ((m = question.match(/^where is (?:the |a |an )?(.+)\?$/))) {
    const subj = canon(m[1])
    const hit = edges.find(([s, r]) => s === subj && r === 'located_in')
    return hit ? (hit[2] as string) : "I don't know."
  }
  if ((m = question.match(/^what color is (?:the |a )?(.+)\?$/))) {
    const subj = canon(m[1])
    const hit = edges.find(([s, r]) => s === subj && r === 'attr')
    return hit ? (hit[2] as string) : "I don't know."
  }
  if ((m = question.match(/^what lives in (?:the |a )?(.+)\?$/))) {
    const loc = canon(m[1])
    const who = edges
      .filter(([, r, o]) => r === 'lives_in' && o === loc)
      .map(([s]) => s)
    return who.length ? who.join(', ') : "I don't know."
  }
  if (
    (m = question.match(
      /^what does (?:the )?child like to do under (?:the )?(.+)\?$/,
    ))
  ) {
    const obj = canon(m[1])
    const hit = edges.find(
      ([s, r, o]) => s === 'child' && o === obj && r.startsWith('likes_to_'),
    )
    return hit ? hit[1].replace(/^likes_to_|_under$/g, '') : "I don't know."
  }
  return 'Query type not recognised.'
}

// ───────────────────────────  CLI  ───────────────────────────
const main = () => {
  const [, , foundationPath, passagePath] = process.argv
  if (!foundationPath || !passagePath) {
    console.error('Usage: ts-node slowpoke_v1.ts foundation.tsv passage.txt')
    process.exit(1)
  }

  const edges: Edge[] = [
    ...loadFoundation(foundationPath),
    ...ingestPassage(fs.readFileSync(passagePath, 'utf8')),
  ]

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  })

  console.log('Ask me questions (empty line to quit) …')
  rl.prompt()

  rl.on('line', (line) => {
    const q = line.trim()
    if (!q) {
      rl.close()
      return
    }
    console.log(answer(edges, q))
    rl.prompt()
  })
}

main()

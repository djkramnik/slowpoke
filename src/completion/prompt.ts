export const posPrompt = `
  For the following input, I want you to perform an NLP dependency parse and return a parseable json array of type Response[] (and nothing else):

  \`\`\`
  export enum PartOfSpeech {
    ADJ = "ADJ",      // adjective
    ADP = "ADP",      // adposition (prepositions and postpositions)
    ADV = "ADV",      // adverb
    AUX = "AUX",      // auxiliary verb
    CCONJ = "CCONJ",  // coordinating conjunction
    DET = "DET",      // determiner
    INTJ = "INTJ",    // interjection
    NOUN = "NOUN",    // noun
    NUM = "NUM",      // numeral
    PART = "PART",    // particle
    PRON = "PRON",    // pronoun
    PROPN = "PROPN",  // proper noun
    PUNCT = "PUNCT",  // punctuation
    SCONJ = "SCONJ",  // subordinating conjunction
    SYM = "SYM",      // symbol
    VERB = "VERB",    // verb
    X = "X"           // other / unknown
  }

  export enum DependencyLabel {
    ROOT = "ROOT",
    ACL = "acl",        // clausal modifier of noun
    ADVCL = "advcl",    // adverbial clause modifier
    ADVMOD = "advmod",  // adverbial modifier
    AMOD = "amod",      // adjectival modifier
    APPOS = "appos",    // appositional modifier
    AUX = "aux",        // auxiliary
    CASE = "case",      // case marking
    CC = "cc",          // coordinating conjunction
    CCOMP = "ccomp",    // clausal complement
    COMPOUND = "compound", // compound noun
    CONJ = "conj",      // conjunct
    COP = "cop",        // copula
    CSUBJ = "csubj",    // clausal subject
    DEP = "dep",        // unspecified dependency
    DET = "det",        // determiner
    DISCOURSE = "discourse", // discourse element
    FIXED = "fixed",    // fixed multiword expression
    FLAT = "flat",      // flat multiword expression
    MARK = "mark",      // marker (e.g. "that" in clauses)
    NMOD = "nmod",      // nominal modifier
    NSUBJ = "nsubj",    // nominal subject
    NUMMOD = "nummod",  // numeric modifier
    OBJ = "obj",        // direct object
    OBL = "obl",        // oblique nominal
    PARATAXIS = "parataxis", // loosely related clauses
    PUNCT = "punct",    // punctuation
    XCOMP = "xcomp",    // open clausal complement
    // add more as needed
  }

  type Response = {
    sentence: string // the original sentence
    tokens: Array<{
      index: number
      text: string // the token text as it appeared in the sentence
      pos: PartOfSpeech
    }> // an ordered array one for each token in the sentence, using a zero based index
    dependencies: Array<{
      head: number
      dependent: number
      label: DependencyLabel
    }>
  }
  \`\`\`
`
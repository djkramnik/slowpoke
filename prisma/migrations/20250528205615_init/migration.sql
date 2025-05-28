-- CreateTable
CREATE TABLE "Entity" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "History" (
    "id" SERIAL NOT NULL,
    "idx" INTEGER NOT NULL,
    "qualifier" TEXT NOT NULL,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityRef" (
    "id" SERIAL NOT NULL,
    "ref" TEXT NOT NULL,
    "entityId" INTEGER,
    "historyId" INTEGER NOT NULL,

    CONSTRAINT "EntityRef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityAct" (
    "id" SERIAL NOT NULL,
    "act" TEXT NOT NULL,
    "refId" INTEGER NOT NULL,
    "targetId" INTEGER,

    CONSTRAINT "EntityAct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActAttr" (
    "id" SERIAL NOT NULL,
    "actId" INTEGER NOT NULL,
    "attr" TEXT NOT NULL,
    "qualifier" TEXT,

    CONSTRAINT "ActAttr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityAttr" (
    "id" TEXT NOT NULL,
    "refId" INTEGER NOT NULL,
    "attr" TEXT NOT NULL,
    "qualifier" TEXT,
    "targetId" INTEGER,

    CONSTRAINT "EntityAttr_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EntityRef" ADD CONSTRAINT "EntityRef_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityRef" ADD CONSTRAINT "EntityRef_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "History"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityAct" ADD CONSTRAINT "EntityAct_refId_fkey" FOREIGN KEY ("refId") REFERENCES "EntityRef"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityAct" ADD CONSTRAINT "EntityAct_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "EntityRef"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActAttr" ADD CONSTRAINT "ActAttr_actId_fkey" FOREIGN KEY ("actId") REFERENCES "EntityAct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityAttr" ADD CONSTRAINT "EntityAttr_refId_fkey" FOREIGN KEY ("refId") REFERENCES "EntityRef"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityAttr" ADD CONSTRAINT "EntityAttr_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "EntityRef"("id") ON DELETE SET NULL ON UPDATE CASCADE;

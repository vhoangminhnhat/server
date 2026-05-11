CREATE TABLE "AiDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT,
    "content" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiDocumentChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT,
    "content" TEXT NOT NULL,
    "searchText" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiDocumentChunk_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AiDocument_userId_idx" ON "AiDocument"("userId");
CREATE INDEX "AiDocumentChunk_documentId_idx" ON "AiDocumentChunk"("documentId");
CREATE INDEX "AiDocumentChunk_userId_idx" ON "AiDocumentChunk"("userId");

ALTER TABLE "AiDocumentChunk"
ADD CONSTRAINT "AiDocumentChunk_documentId_fkey"
FOREIGN KEY ("documentId") REFERENCES "AiDocument"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

---
name: get-started
description: Connect llmlite memory and search the user's legal documents.
---

# Get started with llmlite Memory

llmlite Memory stores the user's private legal documents and returns relevant
passages. The host assistant is responsible for reasoning and writing the final
answer.

## First run

1. Ask the user to sign in at https://www.llmlite.xyz/auth if the OAuth
   connection has not been approved yet.
2. Call `list_vaults` to show the user what document collections are available.
3. Call `list_folders` and `list_documents` when the user wants to inspect a
   specific vault or folder.

## Answering questions

1. Call `search_documents` with the user's question as `query`.
2. Answer only from the returned passages.
3. Cite passages as [1], [2], matching the source order, and mention the
   document name and page number when available.
4. If no passages are returned, say that the documents do not contain
   supporting information. Never invent clauses, dates, or citations.

## Importing documents

1. Call `ingest_text_document` with a file name and the full plain text.
2. If the user wants a specific location, create a vault with `create_vault`
   and a folder with `create_folder` first.
3. Confirm the returned document ID and chunk count.

## Boundaries

- Do not delete documents; deletion is only available in the web app.
- Do not access documents from another account.
- Do not provide general legal advice unrelated to the user's documents.

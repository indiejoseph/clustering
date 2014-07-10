'use strict'

fs = require 'fs'
path = require 'path'

DS_STORE     = '.DS_Store'
corpusFolder = './documents'
klassFolders = fs.readdirSync corpusFolder

doc2kls   = {}
docWords  = {}
documents = {}
idf       = {}

for klass in klassFolders when klass isnt DS_STORE

  docFiles = fs.readdirSync path.join(corpusFolder, klass)

  for docFile in docFiles when docFile isnt DS_STORE
    doc2kls[docFile] = klass
    docWords[docFile] = {}

    # read file
    content = fs.readFileSync path.join(corpusFolder, klass, docFile), 'utf8'

    # tokenize
    words = content.split /[\n\r\s]+/g

    # docs
    documents[docFile] = content

    # count dict by doc
    for word in words
      docWords[docFile][word] = (docWords[docFile][word]+1 or 1)

    # count idf
    for word in Object.keys(docWords[docFile])
      idf[word] = (idf[word]+1 or 1)

# calcuate idf
totalIDF = Object.keys(idf).length
for word of idf
  idf[word] = Math.log(totalIDF / (idf[word] + 1))

fs.writeFileSync './idf.json', JSON.stringify(idf, null, 4)
fs.writeFileSync './doc_words.json', JSON.stringify(docWords, null, 4)
fs.writeFileSync './doc2kls.json', JSON.stringify(doc2kls, null, 4)
fs.writeFileSync './docs.json', JSON.stringify(documents, null, 4)

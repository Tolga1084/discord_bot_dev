const { MongoServerError } = require('mongodb');
const db = process.env['AppDatabase']
const getMongoClient = require("../_helpers/getMongoClient.js")

// check if the word exists in the dictionary.
// first looks for exact matches; if not, then looks for base matches where (â == a)

async function dictQuery (word) {

    const mongoClient = await getMongoClient();

    try {
        let res = await mongoClient.db(db).collection("TR_dictionary2").findOne({madde: word}, {
            collation: {
                locale: 'tr',
                strength: 2
            }
        });

        if (res === null) {
            res = await mongoClient.db(db).collection("TR_dictionary2").findOne({madde: word}, {
                collation: {
                    locale: 'tr',
                    strength: 1
                }
            })
        }
        return res;

    }catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR dictQuery: ${error}`); // special case for some reason
        }
        throw error
    }
}

module.exports = dictQuery

/* INDEXES
{
    v: 2,
    key: { madde: 1 },
    name: 'madde_col_str1',
    background: false,
    collation: {
      locale: 'tr',
      caseLevel: false,
      caseFirst: 'off',
      strength: 1,
      numericOrdering: false,
      alternate: 'non-ignorable',
      maxVariable: 'punct',
      normalization: false,
      backwards: false,
      version: '57.1'
    }
  },
  {
    v: 2,
    key: { madde: 1 },
    name: 'madde_col_str2',
    background: false,
    collation: {
      locale: 'tr',
      caseLevel: false,
      caseFirst: 'off',
      strength: 2,
      numericOrdering: false,
      alternate: 'non-ignorable',
      maxVariable: 'punct',
      normalization: false,
      backwards: false,
      version: '57.1'
    }
  }
}*/
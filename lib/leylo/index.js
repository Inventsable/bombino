const db = require("./init");

module.exports = {
  getCollection: async function(collection, getData = true) {
    return await db
      .collection(collection)
      .get()
      .then(snapshot => {
        if (!snapshot.docs.length) return false;
        return Promise.all(
          snapshot.docs.map(doc => {
            return Promise.resolve(getData ? doc.data() : doc);
          })
        );
      });
  }
};

const {
  initializeApp
} = require("firebase-admin/app");
const {
  getFirestore
} = require("firebase-admin/firestore");
initializeApp();

const db = getFirestore();
const gameDb = db.collection("game")


exports.createGame = async (userId, groupId) => {

  const gameDocument = gameDb.where("groupId", "==", groupId).where("userId", "==", userId)
  const gameCount = await gameDocument.count().get()
  if (gameCount.data().count === 0) {
    const result = await gameDb.add({
      ownerId: userId,
      groupId: groupId,
      ownerSelect: false,
      endgame: false,
      users: [],
      createAt: Date.now()
    })
    return result.id
  }
  return false

}

exports.deleteUserGroup = async (userId, groupId) => {
  const gameDocument = gameDb.where("groupId", "==", groupId).where("userId", "==", userId)
  await gameDocument.get().then(function (querySnapshot) {
    querySnapshot.forEach(function (doc) {
      doc.ref.delete();
    });
  });

}

exports.deleteGameGroup = async (groupId) => {
  const gameDocument = gameDb.where("groupId", "==", groupId)
  await gameDocument.get().then(function (querySnapshot) {
    querySnapshot.forEach(function (doc) {
      doc.ref.delete();
    });
  });

}
exports.deleteGameUserId = async (groupId, userId) => {

  let gameDocument = gameDb.where("groupId", "==", groupId).where('ownerId', '==', userId)
  await gameDocument.get().then(function (querySnapshot) {
    querySnapshot.forEach(function (doc) {
      doc.ref.delete();
    });
  });

}
exports.endGame = async (groupId, userId, gameId) => {

  try {

    const gameDocument = gameDb.where('groupId', '==', groupId)
      .where('ownerId', '==', userId)
      .where('endgame', '==', false)
    const gameCount = await gameDocument.count().get()
    // return gameCount.data().count
    if (gameCount.data().count > 0) {
      const querySnapshot = await gameDocument.get();
      for (const doc of querySnapshot.docs) {
        await gameDb.doc(doc.id).update({
          endgame: true,
        });
        return true;
      }
    } else {
      return false;
    }

  } catch (error) {
    return false;
  }

}

exports.updateInsertOwnerSelect = async (groupId, gameId, item, userId) => {
  try {
    const querySnapshot = await gameDb
      .where('groupId', '==', groupId)
      .where('endgame', '==', false)
      .get();
    for (const doc of querySnapshot.docs) {
      if (userId === doc.data().ownerId) {
        if (doc.id === gameId && !doc.data().ownerSelect) {
          await gameDb.doc(doc.id).update({
            ownerSelect: item,
          });
          return "done";
        } else {
          return "selected";
        }
      } else {
        return false;
      }

    }
  } catch (error) {
    return false;
  }
};
exports.getUserByGame = async (groupId, gameId, userId) => {
  try {
    const querySnapshot = await gameDb
      .where('groupId', '==', groupId)
      .where('ownerId', '==', userId)
      .where('endgame', '==', true)
      .get();
    for (const doc of querySnapshot.docs) {
      if (doc.id === gameId) {
        return doc.data();
      }
    }
  } catch (error) {
    return false;
  }
};
exports.updateInsertJoinerSelect = async (groupId, gameId, item, userId) => {
  try {
    const querySnapshot = await gameDb
      .where('groupId', '==', groupId)
      .where('endgame', '==', false)
      .get();
    for (const doc of querySnapshot.docs) {

      if (doc.id === gameId && doc.data().ownerId !== userId) {
        let userlistItem = doc.data().users
        const dataLength = Object.keys(userlistItem).length;

        let arrayData = userlistItem

        if (dataLength > 0 ) {

          for (const [index, userObject] of userlistItem.entries()) {
            let memberId = Object.keys(userObject)[index];
            if (userId !== memberId) {
              const newData = {
                [userId]: item,
              };

              arrayData.push(newData)

              await gameDb.doc(doc.id).update({
                users: arrayData,
              });
              return true;
            } else {
              return false;
            }
          }
        } else {

          const newData = {
            [userId]: item,
          };
          arrayData.push(newData)
          await gameDb.doc(doc.id).update({
            users: arrayData,
          });

          return true;
        }

      }

      return false;
    }
  } catch (error) {
    return false;
  }
};

exports.getCountGameGroupStatus = async (groupId, status) => {
  const gameDocument = gameDb.where("groupId", "==", groupId).where('endgame', '==', status)
  const gameCount = await gameDocument.count().get()
  return gameCount.data().count
}
exports.getCheckGameGroupStatus = async (groupId, gameId) => {

  const querySnapshot = await gameDb
    .where('groupId', '==', groupId)
    .where('endgame', '==', false)
    .get();

  const gameDocument = gameDb.where('groupId', '==', groupId)
    .where('endgame', '==', false)
  const gameCount = await gameDocument.count().get()
  if (gameCount.data().count > 0) {

    for (const doc of querySnapshot.docs) {
      if (doc.id === gameId) {
        return true;
      } else {
        return false;
      }

    }
  } else {
    return false;
  }
}
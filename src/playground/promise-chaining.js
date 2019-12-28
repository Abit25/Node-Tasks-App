require("../db/mongoose");
const Tasks = require("../models/Task");

// Tasks.findByIdAndDelete("5df3ef22f40f5cbb6411cd94")
//   .then(result => {
//     console.log(result);
//     return Tasks.countDocuments({ isComplete: false });
//   })
//   .then(result => {
//     console.log(result);
//   })
//   .catch(e => {
//     console.log(e);
//   });

const deleteTaskAndCount = async id => {
  const task = Tasks.findByIdAndDelete(id);
  const count = Tasks.find({ isComplete: false });
  return count;
};

deleteTaskAndCount("5df531ae4c05bcc022d2fcb8")
  .then(count => {
    console.log(count);
  })
  .catch(e => {
    console.log(e);
  });

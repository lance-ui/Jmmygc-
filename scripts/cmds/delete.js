const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "delete",
    aliases: ["d", "del", "clear"],
    version: "3.0",
    author: "Subash",
    countDown: 3,
    role: 2,
    category: "owner",
    shortDescription: "Delete",
    longDescription: "Delete",
    
    guide: {
      en: "{pn} (Clean cache and temp files\n{pn} <file.js> (Deletes specific command)\n{pn} images (Deletes cache images)"
    },
  },

  onStart: async function ({ args, api, event }) {
    const subash = ["100083670401783"];
    if (!subash.includes(event.senderID)) {
     return api.sendMessage(
        "❌ | You don't have the access.",
        event.threadID,
        event.messageID
      );
    }

    const directoriesToDelete = ['cache', 'tmp'];
    const fileName = args[0];

    try {
      const imagesFolder = path.join(__dirname, 'cache');
      if (!fs.existsSync(imagesFolder)) {
        fs.mkdirSync(imagesFolder);
      }

      if (fileName === "images") {
        const imagesFolder = path.join(__dirname, 'cache');
        
        if (fs.existsSync(imagesFolder)) {
          const imageFiles = fs.readdirSync(imagesFolder);

          if (imageFiles.length === 0) {
            api.sendMessage("🚫 | The 'cache' folder is already empty.", event.threadID, event.messageID);
          } else {
            for (const imageFile of imageFiles) {
              const imagePath = path.join(imagesFolder, imageFile);
              fs.unlinkSync(imagePath);
            }
            api.sendMessage("✅ | All cache images are cleared up.", event.threadID, event.messageID);
          }
        } else {
          api.sendMessage("❌ | Folder 'cache' doesn't exist.", event.threadID, event.messageID);
        }
      } else if (fileName) {
        const filePath = path.join(__dirname, fileName);

        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(err);
            api.sendMessage(`❌ | Cmd file "${fileName}" doesn't exit.`, event.threadID, event.messageID);
            return;
          }
          api.sendMessage(`✅ | Cmd file "${fileName}" deleted.`, event.threadID, event.messageID);
        });
      } else {
        console.log("Starting cleanup process...");
        for (const directory of directoriesToDelete) {
          const directoryPath = path.join(__dirname, directory);
          const files = fs.readdirSync(directoryPath);

          for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const fileStat = fs.statSync(filePath);

            if (fileStat.isFile()) {
              fs.unlinkSync(filePath);
              console.log(`Deleted file: ${filePath}`);
            }
          }
        }        
    console.log("Cleanup process completed successfully!");

        const deletedFilesCount = directoriesToDelete.reduce((total, dir) => {
          const directoryPath = path.join(__dirname, dir);
          const files = fs.readdirSync(directoryPath);
          return total + files.length;
        }, 0);
        api.sendMessage(`Deleted all unwanted caches and temp files from the project.`, event.threadID, event.messageID);
      }
    } catch (err) {
      console.error(err);
      api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
    }
  }
};

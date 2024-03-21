const { config } = global.GoatBot;
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "🙃 | L A N C E"

module.exports = {
    config: {
        name: "help",
        version: "1.17",
        author: "NTKhang",
        countDown: 3,
        role: 0,
        shortDescription: {
            vi: "Xem cách dùng lệnh",
            en: "View command usage"
        },
        longDescription: {
            vi: "Xem cách sử dụng của các lệnh",
            en: "View command usage"
        },
        category: "General",
        guide: {
            en: "{pn} [empty | <page number> | <command name>]"
                + "\n\n{pn} <command name> [-u | usage | -g | guide]: only show command usage"
                + "\n\n{pn} <command name> [-i | info]: only show command info"
                + "\n\n{pn} <command name> [-r | role]: only show command role"
                + "\n\n{pn} <command name> [-a | alias]: only show command alias"
                + "\n\nhelp file -> reply this to any file except audio and text."
                + "\n\nhelp reset -> send this as a mesage to reset the current file"
        },
        priority: 1
    },
    
    langs: {
       en: {
            help: "╭─────────────⭓\n%1\n├─────⭔\n│ Page [ %2/%3 ]\n│ Currently, the bot has %4 commands that can be used\n│ » Type %5help <page> to view the command list\n│ » Type %5help to view the details of how to use that command\n├────────⭔\n│ %6\n╰─────────────⭓",
            help2: "%1\n» Total %2 commands\n» %4",
            commandNotFound: "Command \"%1\" does not exist.",
            getInfoCommand: "─── 𝖭𝖠𝖬𝖤 ────⭓\n» %1\n─── 𝖨𝖭𝖥𝖮\n» 𝖠𝗅𝗂𝖺𝗌𝖾𝗌: %3\n» 𝖮𝗍𝗁𝖾𝗋 𝗇𝖺𝗆𝖾𝗌: %4\n» 𝖵𝖾𝗋𝗌𝗂𝗈𝗇: %5\n» 𝖱𝗈𝗅𝖾: %6\n» 𝖢𝗈𝗈𝗅𝖽𝗈𝗐𝗇: %7s\n» 𝖠𝗎𝗍𝗁𝗈𝗋: %8\n» 𝖣𝖾𝗌𝖼𝗋𝗂𝗉𝗍𝗂𝗈𝗇: %2\n\n─── 𝖴𝖲𝖠𝖦𝖤 𝖦𝖴𝖨𝖣𝖤\n%9\n\n─── 𝖭𝖮𝖳𝖤𝖲\n• The content inside <XXX> can be changed\n• The content inside [a|b|c] is a or b or c",
        onlyInfo: "── INFO ────⭓\n» Command name: %1\n» Description: %2\n» Aliases: %3\n» Other names: %4\n» Version: %5\n» Role: %6\n» Cooldown: %7s\n» Author: %8\n─────────────⭔",
        onlyUsage: "── USAGE ────⭓\n%1\n─────────────⭔",
        onlyAlias: "── ALIAS ────⭓\n» Aliases: %1\n» Other names: %2\n─────────────⭔",
        onlyRole: "── ROLE ────⭓\n» %1\n─────────────⭔",
        doNotHave: "Do not have",
        roleText0: "0 (All users)",
        roleText1: "1 (Administrators)",
        roleText2: "2 (Admin)",
        roleText0setRole: "0 (set role, all users)",
        roleText1setRole: "1 (set role, administrators)",
        pageNotFound: "Page %1 does not exist."
               }
           },

    onStart: async function ({ message, args, event, threadsData, getLang, role }) {
        const langCode = await threadsData.get(event.threadID, "data.lang") || global.GoatBot.config.language;
        let customLang = {};
        const pathCustomLang = path.normalize(`${process.cwd()}/languages/cmds/${langCode}.js`);
        if (fs.existsSync(pathCustomLang))
            customLang = require(pathCustomLang);

        const { threadID } = event;
        const threadData = await threadsData.get(threadID);
        const prefix = getPrefix(threadID);
        let sortHelp = threadData.settings.sortHelp || "name";
        if (!["category", "name"].includes(sortHelp))
            sortHelp = "category";
        const commandName = (args[0] || "").toLowerCase();
        const command = commands.get(commandName) || commands.get(aliases.get(commandName));

        const folderPath = 'scripts/cmds/help';

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        const files = await fs.readdir(folderPath);

        const attachments = [];
        
        for (const file of files) {
        const filePath = path.join(folderPath, file);
        const fileStream = fs.createReadStream(filePath);
        attachments.push(fileStream);
        }

        const messageContent = {
        attachment: attachments
        };

        if (!command && !args[0] || !isNaN(args[0])) {
            const arrayInfo = [];
            let msg = "";
          if (sortHelp == "name") {
const page = parseInt(args[0]) || 1;
const numberOfOnePage = 30;
for (const [name, value] of commands) {
    if (value.config.role > 1 && role < value.config.role)
        continue;
    let describe = name;
    let shortDescription;
    const shortDescriptionCustomLang = customLang[name]?.shortDescription;
    if (shortDescriptionCustomLang != undefined)
        shortDescription = checkLangObject(shortDescriptionCustomLang, langCode);
    else if (value.config.shortDescription)
        shortDescription = checkLangObject(value.config.shortDescription, langCode);
    if (shortDescription)
        describe += `: ${cropContent(shortDescription.charAt(0).toUpperCase() + shortDescription.slice(1))}`;
    arrayInfo.push({
        data: describe,
        priority: value.priority || 0
    });
}

arrayInfo.sort((a, b) => a.data - b.data);
arrayInfo.sort((a, b) => a.priority > b.priority ? -1 : 1);
const { allPage, totalPage } = global.utils.splitPage(arrayInfo, numberOfOnePage);
if (page < 1 || page > totalPage)
    return message.reply(getLang("pageNotFound", page));

const returnArray = allPage[page - 1] || [];
const startNumber = (page - 1) * numberOfOnePage + 1;
msg += (returnArray || []).reduce((text, item, index) => text += `│ ${index + startNumber}${index + startNumber < 10 ? " " : ""}. ${item.data}\n`, '').slice(0, -1);
await message.reply({ body: getLang("help", msg, page, totalPage, commands.size, prefix, doNotDelete), attachment: messageContent.attachment });
}
     //Sorthelp Category
  else if (sortHelp == "category") {
    let categoryCommands = new Map();

    for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) {
            continue;
        }

        const categoryName = (value.config.category || "No Category").toUpperCase();
        const circularSymbol = "";
        if (!categoryCommands.has(categoryName)) {
            categoryCommands.set(categoryName, []);
        }
       categoryCommands.get(categoryName).push(`${circularSymbol}${name}`);
    }

    const sortedCategories = Array.from(categoryCommands.keys()).sort();
    let msg = "";
    for (const category of sortedCategories) {
        const commands = categoryCommands.get(category);
        msg += `───⌈ ${category} ⌋───\n${commands.join(", ")}\n\n`;
    }

    await message.reply({ body: getLang("help2", msg, commands.size, prefix, doNotDelete), attachment: messageContent.attachment });
}
        }
        else if (!command && args[0]) {
            return message.reply(getLang("commandNotFound", args[0]));
        }
        else {
            const formSendMessage = {};
            const configCommand = command.config;

            let guide = configCommand.guide?.[langCode] || configCommand.guide?.["en"];
            if (guide == undefined)
                guide = customLang[configCommand.name]?.guide?.[langCode] || customLang[configCommand.name]?.guide?.["en"];

            guide = guide || {
                body: ""
            };
            if (typeof guide == "string")
                guide = { body: guide };
            const guideBody = guide.body
                .replace(/\{prefix\}|\{p\}/g, prefix)
                .replace(/\{name\}|\{n\}/g, configCommand.name)
                .replace(/\{pn\}/g, prefix + configCommand.name);

            const aliasesString = configCommand.aliases ? configCommand.aliases.join(", ") : getLang("doNotHave");
            const aliasesThisGroup = threadData.data.aliases ? (threadData.data.aliases[configCommand.name] || []).join(", ") : getLang("doNotHave");

            let roleOfCommand = configCommand.role;
            let roleIsSet = false;
            if (threadData.data.setRole?.[configCommand.name]) {
                roleOfCommand = threadData.data.setRole[configCommand.name];
                roleIsSet = true;
            }

            const roleText = roleOfCommand == 0 ?
                (roleIsSet ? getLang("roleText0setRole") : getLang("roleText0")) :
                roleOfCommand == 1 ?
                    (roleIsSet ? getLang("roleText1setRole") : getLang("roleText1")) :
                    getLang("roleText2");

            const author = configCommand.author;
            const descriptionCustomLang = customLang[configCommand.name]?.longDescription;
            let description = checkLangObject(configCommand.longDescription, langCode);
            if (description == undefined)
                if (descriptionCustomLang != undefined)
                    description = checkLangObject(descriptionCustomLang, langCode);
                else
                    description = getLang("doNotHave");

            let sendWithAttachment = false; // check subcommand need send with attachment or not

            if (args[1]?.match(/^-g|guide|-u|usage$/)) {
                formSendMessage.body = getLang("onlyUsage", guideBody.split("\n").join("\n"));
                sendWithAttachment = true;
            }
            else if (args[1]?.match(/^-a|alias|aliase|aliases$/))
                formSendMessage.body = getLang("onlyAlias", aliasesString, aliasesThisGroup);
            else if (args[1]?.match(/^-r|role$/))
                formSendMessage.body = getLang("onlyRole", roleText);
            else if (args[1]?.match(/^-i|info$/))
                formSendMessage.body = getLang("onlyInfo", configCommand.name, description, aliasesString, aliasesThisGroup, configCommand.version, roleText, configCommand.countDown || 1, author || "");
            else {
                formSendMessage.body = getLang("getInfoCommand", configCommand.name, description, aliasesString, aliasesThisGroup, configCommand.version, roleText, configCommand.countDown || 1, author || "", `${guideBody.split("\n").join("\n")}`);
                sendWithAttachment = true;
            }

            if (sendWithAttachment && guide.attachment) {
                if (typeof guide.attachment == "object" && !Array.isArray(guide.attachment)) {
                    const promises = [];
                    formSendMessage.attachment = [];

                    for (const keyPathFile in guide.attachment) {
                        const pathFile = path.normalize(keyPathFile);

                        if (!fs.existsSync(pathFile)) {
                            const cutDirPath = path.dirname(pathFile).split(path.sep);
                            for (let i = 0; i < cutDirPath.length; i++) {
                                const pathCheck = `${cutDirPath.slice(0, i + 1).join(path.sep)}${path.sep}`; // create path
                                if (!fs.existsSync(pathCheck))
                                    fs.mkdirSync(pathCheck); // create folder
                            }
                            const getFilePromise = axios.get(guide.attachment[keyPathFile], { responseType: 'arraybuffer' })
                                .then(response => {
                                    fs.writeFileSync(pathFile, Buffer.from(response.data));
                                });

                            promises.push({
                                pathFile,
                                getFilePromise
                            });
                        }
                        else {
                            promises.push({
                                pathFile,
                                getFilePromise: Promise.resolve()
                            });
                        }
                    }

                    await Promise.all(promises.map(item => item.getFilePromise));
                    for (const item of promises)
                        formSendMessage.attachment.push(fs.createReadStream(item.pathFile));
                }
            }

            return message.reply(formSendMessage);
        }
    },
    
 onChat: async function ({ message, event }) {
      
    const isAdmin = config.adminBot.includes(event.senderID);

    if (event.body && event.body.toLowerCase() === "help file" && isAdmin) {
        const fileUrl = event.messageReply && event.messageReply.attachments[0].url;

        if (!fileUrl) {
            return message.reply("❌ No valid attachment found.");
        }

        const folderPath = 'scripts/cmds/help';

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        try {
            const files = await fs.readdir(folderPath);
            for (const file of files) {
                await fs.unlink(path.join(folderPath, file));
            }
        } catch (error) {
            return message.reply("❌ Error clearing folder: " + error);
        }

        const response = await axios.get(fileUrl, {
            responseType: "arraybuffer",
            headers: {
                'User-Agent': 'axios'
            }
        });

        const contentType = response.headers['content-type'];
        if (contentType.includes('image')) {
            const imagePath = path.join(folderPath, 'image.jpg');
            fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));
        } else if (contentType.includes('video') || contentType.includes('gif')) {
            const ext = contentType.includes('video') ? '.mp4' : '.gif';
            const mediaPath = path.join(folderPath, 'media' + ext);
            fs.writeFileSync(mediaPath, Buffer.from(response.data, 'binary'));
        } else {
            return message.reply("❌ Invalid attachment format. Reply only with an image, video, or gif");
        }

        message.reply("✅ File saved successfully.");
    } else if (event.body && event.body.toLowerCase() === "help reset" && isAdmin) {
        try {
            const folderPath = 'scripts/cmds/help';

            if (fs.existsSync(folderPath)) {
                const files = await fs.readdir(folderPath);
                for (const file of files) {
                    await fs.unlink(path.join(folderPath, file));
                }
                message.reply("✅ Folder cleared successfully.");
            } else {
                return message.reply("❌ Folder does not exist.");
            }
        } catch (error) {
            return message.reply("❌ Error clearing folder: " + error);
        }
    } else if (event.body && event.body.toLowerCase() === "help reset" && !isAdmin) {
        return message.reply("❌ Only admins can remove the file.");
    }
}
};

function checkLangObject(data, langCode) {
    if (typeof data == "string")
        return data;
    if (typeof data == "object" && !Array.isArray(data))
        return data[langCode] || data.en || undefined;
    return undefined;
}

function cropContent(content, max) {
    if (content.length > max) {
        content = content.slice(0, max - 3);
        content = content + "...";
    }
    return content;
}

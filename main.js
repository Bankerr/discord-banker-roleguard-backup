const { MessageEmbed } = require('discord.js');
const moment = require('moment');
moment.locale('tr');
const whitelist = require('./config.json');
const config = require('./config.json');
const backup = require("./models/rolBackup.js");
const mongoose = require("mongoose");
const Bots = global.Bots = [];
const { Client } = require("discord.js");
const client = new Client();    


client.on("ready", async () => {
  setRoleBackup();
  setInterval(() => {
    setRoleBackup();
  }, 1000*60*60*1);
});

mongoose.connect(config.mongourl, { useNewUrlParser: true, useUnifiedTopology: true }).catch(err =>  console.log('[MODERASYON] Database bağlanamadı!!'));

  let Tokens = config.Dagıtıcılar;
  
  Tokens.forEach(token => {
      let bot = new Client();
  
bot.on("ready", () => {
bot.user.setPresence({ activity: { name: `${config.GuardActivity}` }, status: "dnd" });
  console.log(`[Banker] ${bot.user.tag} ~ Dağıtıcı Aktif!`);
  bot.Busy = false;
  bot.Uj = 0;
  Bots.push(bot);


      })
bot.login(token).then(e => {
}).catch(e => {
  console.error(`[Banker] ${token.substring(Math.floor(token.length / 2))} giriş yapamadı.`);
      });
  });
  client.on("ready", () => {
    client.user.setPresence({ activity: { name: `${config.GuardActivity}` }, status: "dnd" });
  });
client.on("message", async message => {
    let embed = new MessageEmbed().setColor("BLACK").setTimestamp().setFooter(config.GuardActivity)
    if (message.author.bot || !message.guild || !message.content.toLowerCase().startsWith(config.botPrefix)) return;
    if (message.author.id !== config.BotOwner) return;
    let args = message.content.split(' ').slice(1);
    let command = message.content.split(' ')[0].slice(config.botPrefix.length);
      
    if(command === "rolkur" && message.author.id === config.BotOwner) {
      if (!args[0] || isNaN(args[0])) return message.channel.send("Geçerli bir rol ID'si belirtmelisin!");

backup.findOne({guildID: config.ServerID, roleID: args[0]}, async (err, roleData) => {
if(!roleData) return message.channel.send(`Belirtiğiniz ID li rolü veri tabanımda bulamadım!`)
const newRole = await message.guild.roles.create({
name: roleData.name,
color: roleData.color,
hoist: roleData.hoist,
mentionable: roleData.mentionable,
permissions: roleData.permissions,
position: roleData.rawPosition
})
await message.channel.send(embed.addField(`Başarılı bir Şekilde \`${newRole.name}\` Rolünü Kurdum : `,`Dağıtım İçin:  \`\`\`${config.botPrefix}backup ${args[0]} <@&${newRole.id}>\`\`\``));
      })
    }
    if(command === "backup" && message.author.id === config.BotOwner) {
      let rol = message.mentions.roles.first();
      if (!args[0] || isNaN(args[0])) return message.channel.send("Geçerli bir rol ID'si belirtmelisin!");
      let data = await backup.findOne({guildID: config.ServerID, roleID: args[0]})
      if(!data) return message.channel.send(`Kurmaya çalıştığınız Rol ID bulunamadı.`)

      setTimeout(async() => {
let kanalPermVeri = data.channelOverwrites;
if (kanalPermVeri) kanalPermVeri.forEach(async(perm, index) => {
  let kanal = message.guild.channels.cache.get(perm.id);
  if (!kanal) return;
  setTimeout(async() => {
let yeniKanalPermVeri = {};
perm.allow.forEach(async(p) => {
yeniKanalPermVeri[p] = true;
});
perm.deny.forEach(async(p) => {
yeniKanalPermVeri[p] = false;
});
await kanal.createOverwrite(rol, yeniKanalPermVeri).catch(err => console.log(`Kanal İzinleri Ayarlarken Bir Hata Oluştu Hata: ${err}`));
  }, index*500);
});
      }, 500);
let length = data.members.length;
if(length <= 0) return console.log(`[Backup] [${rol.name} ${rol.id}] Olayında kayıtlı üye olmadığından dolayı rol dağıtımı gerçekleştirmedim. `);
let availableBots = Bots.filter(e => !e.Busy);
if(availableBots.length <= 0) availableBots = Bots.sort((x,y) => y.Uj - x.Uj).slice(0, Math.round(length / Bots.length));
let perAnyBotMembers = Math.floor(length / availableBots.length);
if(perAnyBotMembers < 1) perAnyBotMembers = 1;
for (let index = 0; index < availableBots.length; index++) {
const bot = availableBots[index];
let ids = data.members.slice(index * perAnyBotMembers, (index + 1) * perAnyBotMembers);
if(ids.length <= 0) {processBot(bot, false, -perAnyBotMembers); break;}
let guild = bot.guilds.cache.get(config.ServerID);
   await message.channel.send(`[Backup] - Başarılı bir şekilde kurulum başladı roller dağıtılıp odalara ekleniyor.`)
ids.every(async id => {
let member = guild.member(id);
if(!member){
  return true;
}
setTimeout(async() => {
if(rol.delete) return console.log(`[Backup] (${rol.id} - ${rol.name}) Olayında Rol Silinindiği İçin Dağıtımı Durdurdum!`);
if(member.roles.cache.has(rol.id)) return;
await member.roles.add(rol.id).catch(err => console.log(`Rol dağıtımda rol vermede hata oluştu.`))
}, index*100);
});
processBot(bot, false, -perAnyBotMembers);
}}
if(command === "yedekle") {
      backup.findOne({guildID: config.ServerID, roleID: role.id}, async (err, savedRole) => {
        if (!savedRole) {
          let newRoleSchema = new backup({
            _id: new mongoose.Types.ObjectId(),
            guildID: config.ServerID,
            roleID: role.id,
            name: role.name,
            color: role.hexColor,
            hoist: role.hoist,
            position: role.rawPosition,
            permissions: role.permissions,
            mentionable: role.mentionable,
            time: Date.now(),
            members: role.members.map(m => m.id),
            channelOverwrites: roleChannelOverwrites
          });
          newRoleSchema.save();
        } else {
          savedRole.name = role.name;
          savedRole.color = role.hexColor;
          savedRole.hoist = role.hoist;
          savedRole.position = role.rawPosition;
          savedRole.permissions = role.permissions;
          savedRole.mentionable = role.mentionable;
          savedRole.time = Date.now();
          savedRole.members = role.members.map(m => m.id);
          savedRole.channelOverwrites = roleChannelOverwrites;
          savedRole.save();
        };
      });

await message.channel.send("Rol veri tabanı kayıt edildi.")
console.log("Rol verileri başarı ile kayıt edildi.")
};
});
  
client.on("roleDelete", async (role) => {
    let logs = await role.guild.fetchAuditLogs({limit: 5,type:"ROLE_DELETE"}).then(e => e.entries.sort((x, y) => y.createdTimestamp - x.createdTimestamp));
    let log = logs.find(e => ((Date.now() - e.createdTimestamp) / (1000)) < 5);
    if(!log || (log && safe(log.executor.id))) return;
    danger = true;
let newRole = await role.guild.roles.create({   
 data:{
name: role.name,
color: role.color,
hoist: role.hoist,
mentionable: role.mentionable,
permissions: role.permissions,
position: role.rawPosition
}
    }).catch();
    let data = await backup.findOne({guildID: config.ServerID, roleID: role.id})
    let rolkanal = client.channels.cache.find(e => e.name === config.DatabaseLogName)
     await rolkanal.send(`${role.name} \`${role.id}\` Rolü Silindi Rolde Kayıtlı Veri Olmadığı İçin Dağıtım Yapamadım!`)
      if(!data) return console.log(`[Banker] [${role.id}] olayında kayıtlı veri olmadığı için dağıtımı yapamadım`)
    
setTimeout(() => {
let kanalPermVeri = data.channelOverwrites;
if (kanalPermVeri) kanalPermVeri.forEach(async (perm, index) => {
  let guild = client.guilds.cache.get(config.ServerID)
  let kanal = guild.channels.cache.get(perm.id);
  if (!kanal) return;
  setTimeout(async () => {
let yeniKanalPermVeri = {};
perm.allow.forEach(async (p) => {
yeniKanalPermVeri[p] = true;
});
perm.deny.forEach(async (p) => {
yeniKanalPermVeri[p] = false;
});
   await kanal.createOverwrite(newRole, yeniKanalPermVeri).catch(console.error);
  }, index*1000);
});
      }, 1000);
let length = data.members.length;
if(length <= 0) return console.log(`[Banker] [${role.id}] Olayında kayıtlı üye olmadığından dolayı rol dağıtımı gerçekleştirmedim. `);
let availableBots = Bots.filter(e => !e.Busy);
if(availableBots.length <= 0) availableBots = Bots.sort((x,y) => y.Uj - x.Uj).slice(0, Math.round(length / Bots.length));
let perAnyBotMembers = Math.floor(length / availableBots.length);
if(perAnyBotMembers < 1) perAnyBotMembers = 1;
for (let index = 0; index < availableBots.length; index++) {
const bot = availableBots[index];
let ids = data.members.slice(index * perAnyBotMembers, (index + 1) * perAnyBotMembers);
if(ids.length <= 0) {processBot(bot, false, -perAnyBotMembers); break;}
console.log(`[Banker] [${role.id}] olayından sonra - Başarılı bir şekilde kurulum başladı roller dağıtılıp odalara ekleniyor.`)
let guild = bot.guilds.cache.get(config.ServerID);
ids.every(async id => {
let member = guild.member(id);
if(!member){
  return true;
}
setTimeout(async() => {
if(member.roles.cache.has(newRole.id)) return;
await member.roles.add(newRole.id).catch(err => console.log(`[Banker] ${member} (${member.id}) Adlı kullanıcıya rol veremedim.`))
}, index*500);

});
processBot(bot, false, -perAnyBotMembers);
  
  }
  let sa = client.channels.cache.find(e => e.name === config.DatabaseLogName)
   await sa.send(`${log.executor} \`(${log.executor.id})\` Tarafından **${role.name}** \`(${role.id})\` Rol Silindi Rol Üyelerine Dağıtılıp Kanal İzinlerine Ekliyorum!`);   
}
)
function processBot(bot, busy, job, equal = false){
    bot.Busy = busy;
    if(equal) bot.Uj = job;
    else bot.Uj += job;

    let index = Bots.findIndex(e => e.user.id == bot.user.id);
    Bots[index] = bot;
}

function safe(id){
    if(id == client.user.id || Bots.some(e => e.user.id == id) || whitelist.WhiteList.includes(id)|| config.BotOwner.includes(id) ||config.Bots.includes(id)) return true;
    return false;
}


function setRoleBackup() {
  let guild = client.guilds.cache.get(config.ServerID);
  if (guild) {
    guild.roles.cache.filter(r => r.name !== "@everyone" && !r.managed).forEach(role => {
      let roleChannelOverwrites = [];
      guild.channels.cache.filter(c => c.permissionOverwrites.has(role.id)).forEach(c => {
let channelPerm = c.permissionOverwrites.get(role.id);
let pushlanacak = { id: c.id, allow: channelPerm.allow.toArray(), deny: channelPerm.deny.toArray() };
roleChannelOverwrites.push(pushlanacak);
      });

      backup.findOne({guildID: config.ServerID, roleID: role.id}, async (err, savedRole) => {
if (!savedRole) {
  let newRoleSchema = new backup({
_id: new mongoose.Types.ObjectId(),
guildID: config.ServerID,
roleID: role.id,
name: role.name,
color: role.hexColor,
hoist: role.hoist,
position: role.rawPosition,
permissions: role.permissions,
mentionable: role.mentionable,
time: Date.now(),
members: role.members.map(m => m.id),
channelOverwrites: roleChannelOverwrites
  });
  newRoleSchema.save();
} else {
  savedRole.name = role.name;
  savedRole.color = role.hexColor;
  savedRole.hoist = role.hoist;
  savedRole.position = role.rawPosition;
  savedRole.permissions = role.permissions;
  savedRole.mentionable = role.mentionable;
  savedRole.time = Date.now();
  savedRole.members = role.members.map(m => m.id);
  savedRole.channelOverwrites = roleChannelOverwrites;
  savedRole.save();
};
      });
    });

    backup.find({guildID: config.ServerID}).sort().exec((err, roles) => {
      roles.filter(r => !guild.roles.cache.has(r.roleID) && Date.now()-r.time > 1000*60*60*24*3).forEach(r => {
backup.findOneAndDelete({roleID: r.roleID});
      });
    });
    console.log(`[Banker] Rol veri tabanı düzenlendi! [${moment(Date.now()).format("HH:mm DD MM YYYY")}]`);
  };
};
  
client.login(config.DatabaseToken).catch(err => console.log(`[Banker] Backup Ana Bot aktif olamadı!`))

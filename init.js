import irc from 'irc';
import DataStore from 'nedb';
import dotenv from 'dotenv';

function init_config(){
  let result = dotenv.config();
  
  if(result.error){
    console.log("No .env file found");
    process.exit(1);
  }

  return result;
}

function init_db(){
  // TODO error handling for db loading
  var db = new DataStore({ filename: 'gb3.db', autoload: true });

  if(!db){
    console.log("Can't init db");
    process.exit(1);  
  }
  // Use a unique constraint for the message to avoid duplicates
  db.ensureIndex({ fieldName: 'content', unique: true });
  return db;
}

function init_irc(){
  // Setup irc client with info from .env
  var client = new irc.Client(
    process.env.SERVER || "irc.slashsnet.org",
    process.env.NICK || "gb3", {
      channels: [process.env.CHANNELS] || ["#test"],
      userName: process.env.NICK || "gb3",
      password: process.env.PASSWORD,
      debug: process.env.QUIET ? false : true,
      showErrors: process.env.QUIET ? false : true, });

  return client;
}

exports.init_config = init_config;
exports.init_db = init_db;
exports.init_irc = init_irc;


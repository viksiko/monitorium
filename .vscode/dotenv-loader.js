const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const path = require('path');

const env = dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenvExpand.expand(env);

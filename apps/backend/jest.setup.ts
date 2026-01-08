import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';

const env = dotenv.config({
    path: '.env',
});

dotenvExpand.expand(env);

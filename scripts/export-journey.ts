import {readFileSync,writeFileSync} from 'node:fs';
import {enrich} from '../lib/journey.ts';
const bank=JSON.parse(readFileSync(new URL('../lib/content/puzzles.json',import.meta.url),'utf8'));
writeFileSync(new URL('../../ios-source/PrismPath/puzzles.json',import.meta.url),JSON.stringify({campaign:bank.campaign.map(enrich),daily:bank.daily.map(enrich)}));

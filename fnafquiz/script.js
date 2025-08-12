
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, update, onValue, get } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";


let showSilhouettes = false;
let lastCorrect = null;


let timerInterval;
let startTime;
let running = false;

function startTimer() {
  if (running) return;
  running = true;
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 10);
}
function updateTimer() {
  const el = document.getElementById("timer");
  if (!el) return;
  const elapsed = Date.now() - startTime;
  const hours = Math.floor(elapsed / 3600000);
  if (hours >= 24) {
    clearInterval(timerInterval);
    return;
  }
  const minutes = Math.floor((elapsed % 3600000) / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  const ms = Math.floor(elapsed % 1000);
  el.textContent =
    `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${String(ms).padStart(3,'0')}`;
}
function stopTimer() {
  clearInterval(timerInterval);
}


function normalizeKey(text) {
  return text.toLowerCase().replace(/[\s.\-_'"]/g, "");
}
function normalize(text) {
  return text.toLowerCase().replace(/[\s.\-_'"]/g, "");
}
function normalizeAlias(text) {
  return text.toLowerCase().trim();
}
function capitalize(text) {
  return text.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
function slugifyGameTitle(title) {
  let s = title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  s = s.replace(/^fnaf_([0-9])(\b|_)/, (_, d) => `fnaf${d}${_ === "_" ? "_" : ""}`);
  return s;
}


const firebaseConfig = {
  apiKey: "AIzaSyASXBFvzjCcp21g5NcI1PqYbX7rFN1UVIs",
  authDomain: "fnafquiz1.firebaseapp.com",
  databaseURL: "https://fnafquiz1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fnafquiz1",
  storageBucket: "fnafquiz1.firebasestorage.app",
  messagingSenderId: "812258358214",
  appId: "1:812258358214:web:9466fc6efa4e0009d538c7",
  measurementId: "G-9BHX9G7GT1"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


function generateRoomId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 6; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return id;
}
async function generateUniqueRoomId(maxTries = 10) {
  for (let i = 0; i < maxTries; i++) {
    const id = generateRoomId();
    const snap = await get(ref(db, `rooms/${id}`));
    if (!snap.exists()) return id;
  }
  throw new Error("No pude generar una sala única. Inténtalo de nuevo.");
}
document.getElementById("create-room")?.addEventListener("click", async () => {
  try {
    const newRoomId = await generateUniqueRoomId();
    localStorage.setItem("justCreatedRoom", newRoomId);
    window.location.hash = newRoomId;
    window.location.reload();
  } catch (err) {
    alert("Error creando sala. Intenta otra vez.");
    console.error(err);
  }
});


function getRoomIdFromURL() {
  return window.location.hash ? window.location.hash.substring(1).toUpperCase() : null;
}
const roomId = getRoomIdFromURL();
const isMultiplayer = !!roomId;
let username = "Jugador";
let foundRef, playersRef;


const DATA_TEXT = `
FNaF 1
Freddy / freddy.png / freddy
Bonnie / bonnie.png / bonnie
Chica / chica.png / chica
Foxy / foxy.png / foxy
Golden Freddy / goldenfreddy.png / golden freddy
Endo-01 / endo01.png / endo-01, endo 01, endo1, endo-1
Mr. Cupcake / mrcupcake.png / cupcake, mr. cupcake, mr cupcake, mrcupcake
Phone Guy / phoneguy.png / ralph, phone guy
Mike Schmidt / mikeschmidt.png / mike schmidt

FNaF 2
JJ / jj.png / jj, balloon girl
Balloon Boy / bb.png / bb, balloon boy
The Puppet / puppet.png / puppet, marionette, the puppet, the marionette
Toy Freddy / toyfreddy.png / toy freddy
Toy Bonnie / toybonnie.png / toy bonnie
Toy Chica / toychica.png / toy chica
Mangle / mangle.png / mangle
Toy Cupcake / toycupcake.png / toy cupcake, toy mr cupcake
Endo-02 / endo02.png / endo-02, endo 02, endo2, endo-2
Withered Freddy / wfreddy.png / withered freddy, w freddy
Withered Bonnie / wbonnie.png / withered bonnie, w bonnie
Withered Chica / wchica.png / withered chica, w chica
Withered Foxy / wfoxy.png / withered foxy, w foxy
Withered Golden Freddy / wgolden.png / withered golden freddy, w golden freddy, w g freddy
RWQFSFASXC / shadowbonnie.png / rwqfsfasxc, shadow bonnie, rxq
Shadow Freddy / shadowfreddy.png / shadow freddy, purple freddy
Paperpals / paperpals.png / paperpals
Fritz Smith / FritzSmith.png / fritz smith
Jeremy Fitzgerald / JeremyFitzgerald.png / jeremy fitzgerald
William Afton / william.png / william, purple guy, vincent

FNaF 3 Troll Game
Freddydude / Freddydude.png / freddydude, animdude freddy
Red Dragon / red.png / red dragon, red monster, red dinosaur
Green Dragon / green.png / green dragon, green monster, green dinosaur

FNaF 3
Springtrap / springtrap.png / springtrap
Phantom Freddy / pfreddy.png / phantom freddy, pfreddy
Phantom Chica / pchica.png / pchica, phantom chica
Phantom Foxy / pfoxy.png / pfoxy, phantom foxy
Phantom Mangle / pmangle.png / pmangle, phantom mangle
Phantom Balloon Boy / pbb.png / pbb, pballoonboy, phantom bb, phantom balloon boy
Phantom Puppet / ppuppet.png / ppuppet, phantom puppet, phantom marionette
Shadow Cupcake / shadowcupcake.png / phantom cupcake, pcupcake, shadow cupcake
Golden Cupcake / goldencupcake.png / golden cupcake
Phone Dude / phonedude.png / phone dude, duane, fnaf 3 phone guy
Shadow Balloon Boy / shadowbb.png / shadowbb, shadow balloon boy
Shadow Puppet / shadowpuppet.png / shadow puppet, shadow marionette
Gabriel / gabriel.png / gabriel, freddy soul
Jeremy / jeremy.png / jeremy, bonnie soul
Susie / susie.png / susie, chica soul
Fritz / fritz.png / fritz, foxy soul
Cassidy / cassidy.png / cassidy, golden freddy soul

FNaF 4
Nightmare Freddy / nfreddy.png / nightmare freddy, nfreddy
Freddles / freddles.png / freddles
Nightmare Bonnie / nbonnie.png / nightmare bonnie, nbonnie
Nightmare Chica / nchica.png / nightmare chica, nchica
Nightmare Cupcake / ncupcake.png / ncupcake, nightmare cupcake
Nightmare Foxy / nfoxy.png / nightmare foxy, nfoxy
Nightmare Fredbear / nfredbear.png / nightmare fredbear, nfredbear, nightmare golden freddy, ngolden freddy
Nightmare / nightmare.png / nightmare, nshadowfreddy, nightmare shadow freddy
Plushtrap / plushtrap.png / plushtrap, nightmare springtrap, nspringtrap, nspring bonnie, nightmare spring bonnie
Freddy Bully / freddybully.png / freddy bully, bully freddy, oswald's father, oswald father, mr renner, kelsey
Bonnie Bully / bonniebully.png / bonnie bully, bully bonnie, help wanted jeremy, cassie's father, cassie father
Chica Bully / chicabully.png / chica bully, bully chica
Crying Child / cc.png / cc, crying child, bv, bite victim, sobbing child, little man, evan afton, dave afton

FNaF World: Halloween Edition
Ball Boy (HE) / ballboyhe.png / Halloween Ball Boy, Ball boy halloween, he ball boy, ball boy he
Mad Endo (HE) / madendohe.png / halloween mad endo, he mad endo, mad endo halloween, mad endo he
Cheesehead / Cheesehead.png / Cheesehead
Tangle (HE) / Tanglehe.png / halloween Tangle, he tangle, Tangle halloween, Tangle he
Prototype (HE) / Prototypehe.png / Prototype haloween, Prototype he, he Prototype, halloween Prototype
Half-Bake / halfbake.png / Half-Bake
Brow Boy (HE) / browboyhe.png / Brow Boy haloween, Brow Boy he, he Brow Boy, halloween Brow Boy
Anchovy / Anchovy.png / Anchovy
Madjack / Madjack.png / Madjack
Quad Endo / QuadEndo.png / Quad Endo
Mudpie / Mudpie.png / Mudpie
Big Jack / BigJack.png / Big Jack
Xangle / Xangle.png / Xangle
Redbear (HE) / redbearhe.png / halloween Redbear, he Redbear, redbear he, Redbear halloween
Mini-P / minip.png / Mini-P
Security (HE) / securityhe.png / halloween Security, he Security, security he, security halloween
Purplegeist / Purplegeisthe.png / halloween Purplegeist, he Purplegeist, Purplegeist he, Purplegeist halloween
Party Hat A / partyhata.png / Party Hat A
Party Hat B / partyhatb.png / Party Hat B

FNaF 4: Halloween Edition
Jack-O-Bonnie / jackobonnie.png / Jack-o-bonnie
Jack-O-Chica / jackochica.png / Jack-o-chica
Jack-O'-Lantern / lantern.png / jack-o-lantern, jack-o'-lantern, mr pumpkin, pumpkin
Nightmare Balloon Boy / nbb.png / nbb, nightmare bb, nightmare balloon boy, n balloon boy
Nightmare Mangle / nmangle.png / nmangle, nightmare mangle
Nightmarionne / npuppet.png / npuppet, nightmare puppet, nightmare marionette, n marionette, nightmarionne

FNaF World
Adventure Freddy / advfreddy.png / adventure freddy, adv freddy
Adventure Bonnie / advbonnie.png / adventure bonnie, adv bonnie
Adventure Chica / advchica.png / adventure chica, adv chcia
Adventure Foxy / advfoxy.png / adventure foxy, adv foxy
Adventure Toy Bonnie / advtbonnie.png / adventure Toy Bonnie, adv t bonnie, adv toy bonnie
Adventure Toy Chica / advtchica.png / adventure Toy Chica, adv t chica, adv toy chica
Adventure Toy Freddy / advtfreddy.png / adventure Toy freddy, adv t freddy, adv toy freddy
Adventure Mangle / advmangle.png / Adventure Mangle, adv mangle
Adventure Balloon Boy / advbb.png / Adventure Balloon Boy, adventure bb, advbb
Adventure JJ / advjj.png / Adventure JJ, Adventure Balloon Girl, adv jj
Adventure Phantom Freddy / advpfreddy.png / Adventure Phantom Freddy, Adventure P freddy, adv p freddy, adv phantom freddy
Adventure Phantom Chica / advpchica.png / Adventure Phantom Chica, Adventure P chica, advpchica, adv phantom chica
Adventure Phantom Balloon Boy / advpbb.png / Adventure Phantom Balloon Boy, Adventure P Balloon Boy, adventure p bb, advpbb, adv phantom bb
Adventure Phantom Foxy / advpfoxy.png / Adventure Phantom Foxy, Adventure P foxy, adv p foxy
Adventure Phantom Mangle / advpmangle.png / Adventure Phantom mangle, Adventure P mangle, adv p mangle
Adventure Withered Bonnie / advwbonnie.png / Adventure Withered Bonnie, adv w bonnie, adv withered bonnie
Adventure Withered Chica / advwchica.png / Adventure Withered Chica, adv w chica, adv withered chica
Adventure Withered Freddy / advwfreddy.png / Adventure Withered Freddy, adv w freddy, adv withered freddy
Adventure Withered Foxy / advwfoxy.png / Adventure Withered Foxy, adv w foxy, adv withered foxy
Adventure Shadow Freddy / advshadowfreddy.png / Adventure Shadow Freddy, adv shadow freddy
Adventure Marionette / advpuppet.png / Adventure marionette, adventure puppet, adv marionette, adv puppet
Adventure Phantom Marionette / advppuppet.png / Adventure Phantom marionette, adventure Phantom puppet, adv Phantom marionette, adv Phantom puppet, adventure p puppet, adventure p marionette, advppuppet, advpmarionette
Adventure Golden Freddy / advgolden.png / adventure golden freddy, adv godlen freddy
Adventure Paperpals / advpaperpals.png / adventure paperpals, adv paperpals
Adventure Nightmare Freddy / advnfreddy.png / adventure Nightmare freddy, adv Nightmare freddy, adventure n freddy, advnfreddy
Adventure Nightmare Bonnie / advnbonnie.png / adventure Nightmare bonnie, adv Nightmare bonnie, adventure n bonnie, advnbonnie
Adventure Nightmare Chica / advnchica.png / adventure Nightmare chica, adv Nightmare chica, adventure n chica, advnchica
Adventure Nightmare Foxy / advnfoxy.png / adventure Nightmare foxy, adv Nightmare foxy, adventure n foxy, advnfoxy
Adventure Endo 01 / advendo1.png / adventure endo 1, adventure endo 01, adv endo 01, adv endo 1
Adventure Endo 02 / advendo2.png / adventure endo 2, adventure endo 02, adv endo 02, adv endo 2
Adventure Plushtrap / advplushtrap.png / adventure plushtrap, adv plushtrap
Adventure Endoplush / advendoplush.png / Adventure Endoplush, adv endoplush
Adventure Springtrap / advspringtrap.png / Adventure Springtrap, adv springtrap
Adventure RWQFSFASXC / advshadowbonnie.png / Adventure rxq, adventure rwqfsfasxc, adv rxq, adv rwqfsfasxc
Adventure Crying Child / advcc.png / Adventure Crying Child, adv crying child, adventure cc, advcc
Adventure Funtime Foxy / advftfoxy.png / adventure funtime foxy, adv funtime foxy, adv ft foxy, adventure ft foxy, adventure toy funtime foxy, advtftfoxy
Adventure Nightmare Fredbear / advnfredbear.png / adventure nightmare fredbear, adv nightmare fredbear, advnfredbear, adventure n fredbear
Adventure Nightmare / advnightmare.png / adventure nightmare, adv nightmare
Adventure Fredbear / advfredbear.png / adv fredbear, adventure fredbear
Adventure Spring Bonnie / advspringbonnie.png / adv spring bonnie, adventure spring bonnie
Adventure Mr. Cupcake / advmrcupcakeotoy.png / Adventure mr cupcake, adv mr cupcake, Adventure cupcake, Adventure toy cupcake
Adventure Nightmare Cupcake / advncupcake.png / Adventure nightmare cupcake, adv nightmare cupcake, adv n cupcake, adventure n cupcake
Adventure Freddles / advfreddles.png / Adventure Freddles, adv freddles
Adventure Ghost Freddy / advghostfreddy.png / Adventure ghost freddy, adv ghost freddy, ghost freddy
Adventure Virtua-Freddy / advvirtual.png / Adventure virtua freddy, adv virtua freddy, virtua freddy
Mimic Ball / mimicball.png / mimic ball
Adventure Lolbit / advlolbit.png / Adv lolbit, adventure lolbit
Gnat / Gnat.png / Gnat
Neon Bee / Neon Bee.png / Neon Bee
Neon Wasp / Neon Wasp.png / Neon Wasp
Medpod 1 / Medpod 1.png / Medpod 1
Medpod 2 / Medpod 2.png / Medpod 2
Mega-Med / Mega-Med.png / Mega-Med
Mini-Reaper / Mini-Reaper.png / Mini-Reaper
Reaper / Reaper.png / Reaper
X-Reaper / X-Reaper.png / X-Reaper
Mini-FO / Mini-FO.png / Mini-FO
UFO / UFO.png / UFO
X-FO / X-FO.png / X-FO
Block5 / Block5.png / Block5
Block20 / Block20.png / Block20
Block50 / Block50.png / Block50
Pop-Pop / Pop-Pop.png / Pop-Pop
BOOM / BOOM.png / BOOM
KABOOM / KABOOM.png / KABOOM
BossDrain01 / BossDrain01.png / BossDrain01
BossDrain02 / BossDrain02.png / BossDrain02
BossDrain-X / BossDrain-X.png / BossDrain-X
Adventure Mendo / mendo.png / mendo, endo mendo, adventure mendo, adv mendo
Adventure Dee Dee / dd.png / deedee, dd, advdd, adventure deedee
8-bit Fredbear / 8bitfredbear.png / 8-bit Fredbear
Old Man Consequences / omc.png / omc, Old Man Consequences
Desk Man / deskman.png / Desk Man, scott cawthon
Bouncepot / Bouncepot.png / Bouncepot
Gearrat / Gearrat.png / Gearrat
Mechrab / Mechrab.png / Mechrab
Chop 'N Roll / chopnroll1.png / Chop 'N Roll, chop n roll
Totemole / Totemole.png / Totemole
Boxbyte / Boxbyte.png / Boxbyte
Chillax / Chillax.png / Chillax
Flan / Flan.png / Flan
Goldmine / Goldmine.png / Goldmine
Metalman / Metalman.png / Metalman
Quarry / Quarry.png / Quarry
Colossal / Colossal.png / Colossal
Crabapple / Crabapple.png / Crabapple
Seaweed / Seaweed.png / Seaweed
Beartrap / Beartrap.png / Beartrap
Graveweed / Graveweed.png / Graveweed
Prototype / Prototype.png / Prototype
Blacktrap / Blacktrap.png / Blacktrap
Rot / Rot.png / Rot
Tombstack / Tombstack.png / Tombstack
Ballboy / Ballboy.png / Ballboy
DogFight / DogFight.png / DogFight
Meringue / Meringue.png / Meringue
Redbear / Redbear.png / Redbear
Tangle (FW) / Tangle.png / Tangle
White Rabbit / White Rabbit.png / White Rabbit
>>>>>> / x6mayorque.png / >>>>>>
_!2222 / glitch2.png / _!2222
%__^^&( / glitch3.png / %__^^&(
Unused Browboy Enemy / unusedbrowboy.png / browboy enemy, enemy browboy, unused browboy
Auto Chipper / Auto Chipper.png / Auto Chipper
Bouncer / Bouncer.png / Bouncer
Eyesore / Eyesore.png / Eyesore
Seagoon / Seagoon.png / Seagoon
Mad Endo / Mad Endo.png / Mad Endo
Browboy / Browboy.png / Browboy
Bubba / Bubba.png / Bubba
Gold Endo / Gold Endo.png / Gold Endo
Snowcone / Snowcone.png / Snowcone
Supergoon / Supergoon.png / Supergoon
Overclock / Overclock.png / Overclock
Porkpatch / Porkpatch.png / Porkpatch
Security / Security.png / Security
Adventure Animdude / advanimdude.png / animdude, adv animdude, adventure animdude, buff animdude, scott boss
Chipper's Revenge / ChipperRevenge.png / Chipper's Revenge, chippers revenge, chipper revenge, Lumber Bot 5.0

FNaF World: Update 2
Adventure Jack-O-Bonnie / advjackobonnie.png / Adventure Jack-o-bonnie, adv Jack-o-bonnie
Adventure Jack-O-Chica / advjackochica.png / Adventure Jack-o-chica, adv Jack-o-chica
Mr. Chipper / chipper.png / Mr. chipper, chipper, adventure chipper, adv chipper
Adventure Nightmare Balloon Boy / advnbb.png / Adventure Nightmare Balloon Boy, adv nightmare balloon boy, adv n balloon boy, advnbb
Adventure Nightmarionne / advnpuppet.png / Adventure npuppet, Adventure nightmare puppet, Adventure nightmare marionette, Adventure n marionette, Adventure nightmarionne
Coffee / coffee.png / Coffee, cofe, coffe, cofee, adventure coffee, adv coffee
Adventure Purpleguy / advpurpleguy.png / Adventure purpleguy, purpleguy, adv purpleguy, Adventure william afton
Adventure Jack-O'-Lantern / advlantern.png / Adventure jack-o-lantern, Adventure jack-o'-lantern, Adventure mr pumpkin, Adventure pumpkin
Kitty / kitty.png / Kitty, cat, Kitty in the Crowd cat, the kitty
P. Goon / P. Goon.png / p.goon
Neon / Neon.png / Neon
Jangle / Jangle.png / Jangle
Wind-up Enemy / Windup.png / Wind-up Mouse, windup enemy, Sawspin, Cogcut, fnaf 57 enemy 1, freddy in space enemy 1, fis enemy 1, Blorgus
Large Robot / larg.png / robot, Large Robot, fnaf 57 enemy 2, freddy in space enemy 2, fis enemy 2
Alien Enemy / alien.png / alien, blue rot, blue flan, blue seaweed, fnaf 57 enemy 3, freddy in space enemy 3, fis enemy 3
Tentacle / tentacle.png / tentacle, fnaf 57 enemy 4, freddy in space enemy 4, fis enemy 4
Laser UFO / laser.png / laser ufo, laser, fnaf 57 enemy 5, freddy in space enemy 5, fis enemy 5
Giant Metalman / metal2.png / Giant Metalman, metalman 2, fnaf 57 enemy 6, freddy in space enemy 6, fis enemy 6
Scott's Head / scotthead.png / scott cawthon head, scott's head, scotts head, scott head, fnaf 57 boss, freddy in space boss, fis boss
Souldozer / Souldozer.png / Souldozer, foxy fighters boss
PurpleGeist / PurpleGeist.png / PurpleGeist
Chica's Magic Rainbow / rainbow.png / rainbow, chica's magic rainbow, chicas magic rainbow

Sister Location: MA
SLMA Kid / slmakid.png / kid, boy, camping boy, slma kid, slma boy
Bug / Bug.png / bug, insect, slma character 1
Bunny / Bunny.png / bunny, rabbit, slma character 2
Snake / Snake.png / snake, serpent, slma character 3
Bat / Bat.png / bat, slma character 4
Decoy / Decoy.png / decoy, scarecrow, dummy, slma character 5
Bear / Bear.png / bear, slma character 6
Zombie / Zombie.png / zombie, slma character 7
Ghost / Ghost.png / Ghost, slma character 8
Spaceship / Spaceship.png / spaceship, slma ufo, slma character 9

FNaF: Sister Location
Circus Baby / baby.png / circus baby, baby
Bidybab / Bidybabs.png / bidybab
Ballora / ballora.png / ballora
Minireena / minireena.png / minireena
Funtime Freddy / ftfreddy.png / ftfreddy, funtime freddy
Bon-Bon / bonbon.png / bonbon, bonnie hand puppet
Funtime Foxy / ftfoxy.png / ftfoxy, funtime foxy
Funtime Lolbit / lolbit.png / lolbit, funtime lolbit, ftlolbit
Ennard / ennard.png / ennard
HandUnit / handunit.png / hand unit
Magician / magician.png / magician
Little Joe / littlejoe.png / Little Joe, lally's lollies
Springlock Suit / springlocksuit.png / springlock suit, springlock, night 4 suit, springsuit
Yenndo / yenndo.png / yenndo, yendo
Human Heads / humanheads.png / module heads, human heads, robotic heads, robot heads, control module heads
Fortune Teller / fortuneteller.png / fortune teller
Fredbear Plush / fredbearplush.png / fredbear plush, plush fredbear, remote fredbear, fredbear remote
Elizabeth Afton / eliza.png / Elizabeth Afton, elisabeth afton, afton's daughter, ice cream girl
Technicians / technicians.png / Technicians, workers, the Technicians, tecnics
Vlad / vlad.png / vlad, vampire
Clara / clara.png / clara, vlad's wife, vlad's mistress
Vampire Child / vampirebaby.png / vampire baby, vampire child, the baby, vlad's baby, clara's baby

FNaF: Sister Location - Custom Night DLC
Bonnet / bonnet.png / bonnet
Electrobab / electrobab.png / electrobab, electric bidybab
Dark Springtrap / darkspringtrap.png / Dark Springtrap
Michael Afton / mikeafton.png / mike afton, michael afton, eggs benedict
Neighbors / naigh.png / Neighbors, The Neighbors, minigame men,  waving man, waving men

FNaF 6 / FFPS
Molten Freddy / molten.png / molten freddy
Afton / afton.png / scraptrap, afton, springscrap
Scrap Baby / scrapbaby.png / scrap baby
Lefty / lefty.png / lefty, lefte
Winking Sign / sign.png / Winking Sign, sign, wink sign
Bucket Bob / bucket.png / bucket bob
Mr. Can-Do / cando.png / Mr. Can-Do, mrcando, cando
Mr. Hugs / mrhugs.png / Mr. Hugs
No. 1 Crate / crate.png / No. 1 Crate, crate
Pan Stan / panstan.png / Pan Stan
Happy Frog / happyfrog.png / Happy Frog
Mr. Hippo / mrhippo.png / Mr. Hippo, hippo
Nedd Bear / neddbear.png / Nedd Bear, nedbear
Pigpatch / pigpatch.png / Pigpatch
Orville Elephant / orville.png / Orville Elephant
Rockstar Freddy / rfreddy.png / Rockstar Freddy, rfreddy
Rockstar Bonnie / rbonnie.png / Rockstar Bonnie, rBonnie
Rockstar Chica / rchica.png / Rockstar chica, rchica
Rockstar Foxy / rfoxy.png / Rockstar Foxy, rfoxy
Music Man / musicman.png / Music Man
El Chip / elchip.png / El Chip
Funtime Chica / ftchica.png / Funtime Chica, ftchica
Funtime Cupcake / ftcupcake.png / funtime cupcake, ft cupcake
Helpy / helpy.png / helpy
Paper Pals / paperpals2.png / simulator paperpals, paperpals 2, fnaf 6 paperpals, ffps paperpals, new paperpals, paperpals fnaf 6, paperpals ffps
Little Girl / littlegirl.png / little girl, fruity maze girl, fruity maze child, fruity maze player
Yellow Bunny / rabbit.png / yellow bunny, yellow rabbit, fruity maze bunny, fruity maze rabbit
JR's Bouncer / jrbouncer.png / jr's bouncer, jrs bouncer, jr bouncer, green man, Midnight Motorist bouncer, Midnight Motorist green guy, green guy, Midnight Motorist green man
Gumball Swivelhands / gumball.png / Gumball Swivelhands, chewing gum machine, chewing gum vending machine
Candy Cadet / candycadet.png / Candy Cadet
Ballpit Tower / tower.png / Ballpit Tower
Lemonade Clown / lemonade.png / Lemonade Clown
Fruit Punch Clown / fruit.png / Fruit Punch Clown
Neon Jukebox / juke.png / Neon Jukebox, jukebox
Egg Baby / egg.png / Egg Baby, data archive
Prize King / king.png / Prize King
Security Puppet / securitypuppet.png / Security Puppet
Fiztime PopSoda / soda.png / fiztime, popsoda, fiztime popsoda, soda
Marty / marty.png / Marty, marty's plunger
Flo / glossy.png / glossy, flo, flo's glossy floss
Warthog / hog.png / wacky wart, wacky wart paste, hog, warthog, dr. wacky wart
The Entrepreneur / entre.png / intro bear, bear intro, The Entrepreneur, Entrepreneur, fnaf 6 bear, bear fnaf 6, yellow bear, the player, ffps bear, bear ffps
Tutorial Unit / tutorialunit.png / Tutorial Unit, fnaf 6 hand unit, hand unit fnaf 6, ffps hand unit, hand unit ffps
R.A.S.C. / rasc.png / rasc, remote activated simulated c
Henry Emily / henryemily.png / Henry, Henry Emily, Hen, Cassette Man
Charlotte Emily / charlotte.png / Henry's Daughter, charlotte, puppet soul, puppet's soul, puppets soul, marionette soul, marionette's soul, marionettes soul
Spring Bonnie / springbonnie.png / Spring Bonnie, Golden Bonnie, Gold Bonnie, The Yellow Rabbit

UCN Demo
Doofas Freddy / doofasfreddy.png / Doofas Freddy, Doofred, Freddy Doofas

UCN
Fredbear / fredbear.png / fredbear
XOR / xor.png / xor, shadow dd, shadow deedee
TFC Funtime Freddy / ftfreddyucn.png / tfc funtime freddy, the fourth closet funtime freddy, ftcftfreddy, the fourth closet ft freddy, gray funtime freddy, gray ft freddy, ucn ft freddy, ucn funtime freddy
Japanese Freddy / japfreddy.png / anime freddy, japanese freddy, samurai freddy, the bear, Bear of Vengeance
Japanese Foxy / japfoxy.png / anime foxy, japanese foxy, samurai fox, the fox
Japanese Mangle / japmangle.png / anime mangle, japanese mangle, samurai mangle
High School Toy Chica / hightoychica.png / High School toy chica, High School chica, yandere toy chica, yandere chica, school toy chica
High School Freddy / highfreddy.png / High School freddy, school freddy
High School Wolf / highwolf.png / High School Wolf, school wolf
High School Toy Bonnie / hightoybonnie.png / High School toy bonnie, school toy bonnie
High School Funtime Foxy / highftfoxy.png / High School Funtime Foxy, school Funtime Foxy
High School Puppet / highpuppet.png / High School puppet, school puppet, High School marionette, school marionette
High School Pigpatch / highPigpatch.png / High School Pigpatch, school Pigpatch
`;


function parseDataText(raw) {
  const categories = [];
  let current = null;
  const lines = raw.split("\n");

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (/^\.+$/.test(line)) continue;
    if (/^\(no añadir personajes\)$/i.test(line)) continue;

    const parts = line.split(" / ").map(s => s.trim());
    const looksLikeItem = (parts.length >= 3) && /\.png$/i.test(parts[1] || "");

    if (!looksLikeItem) {
      const title = line;
      const key = slugifyGameTitle(title);
      current = { key, title, list: [] };
      categories.push(current);
      continue;
    }

    if (!current) {
      current = { key: "uncategorized", title: "Uncategorized", list: [] };
      categories.push(current);
    }

    const display = parts[0];
    const imgFile = parts[1];
    const rawAliases = (parts[2] || "")
      .split(",")
      .map(a => a.trim())
      .filter(Boolean);

    const aliases = rawAliases.length ? rawAliases : [display];

    current.list.push({
      name: normalizeAlias(display),
      img: `img/${imgFile}`,
      aliases,
      displayName: display,
    });
  }

  const G = {};
  for (const g of categories) G[g.key] = { title: g.title, list: g.list };
  return G;
}

const GAMES = parseDataText(DATA_TEXT);


const foundByGame = {};
Object.keys(GAMES).forEach(k => (foundByGame[k] = []));


function createSections() {
  const host = document.getElementById("games");
  if (!host) return;
  host.innerHTML = "";
  for (const [key, cfg] of Object.entries(GAMES)) {
    const section = document.createElement("div");
    section.className = "game-section";
    section.innerHTML = `
      <div class="game-header" data-game="${key}">
        <span>${cfg.title}</span>
        <span class="arrow">▼</span>
      </div>
      <div id="grid-${key}" class="grid"></div>
    `;
    host.appendChild(section);
  }
  host.addEventListener("click", (e) => {
    const header = e.target.closest(".game-header");
    if (!header) return;

    const grid = header.nextElementSibling;
    if (grid) grid.querySelectorAll("img.revealed")
      .forEach(img => img.classList.remove("revealed"));

    header.classList.toggle("collapsed");
  });

}

function renderGrid(animList, foundList, containerId) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  grid.innerHTML = "";

  animList.forEach(anim => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.draggable = false;

    const keyName = normalizeKey(anim.displayName || anim.name);
    const isFound = foundList.includes(keyName);

   
    img.classList.remove("silhouette");
    if (isFound) {
      img.src = anim.img;
    } else if (showSilhouettes) {
      img.src = anim.img;
      img.classList.add("silhouette");
    } else {
      img.src = "img/question.png";
    }

   
    if (isFound && (anim.displayName || anim.name) === lastCorrect) {
      if (!img.classList.contains("silhouette")) {
        img.classList.remove("revealed");
        void img.offsetWidth; // reflow
        img.classList.add("revealed");
        const onEnd = (ev) => {
          if (ev.animationName === "popin") {
            img.classList.remove("revealed");
            img.removeEventListener("animationend", onEnd);
          }
        };
        img.addEventListener("animationend", onEnd);
      }
    }

    
    const label = document.createElement("div");
    const display = anim.displayName || capitalize(anim.name);

    label.innerHTML = "";
    display.split(" ").forEach((w, i, arr) => {
      const sp = document.createElement("span");
      sp.className = "name-part";
      sp.textContent = w;
      sp.style.display = "inline-block";
      sp.style.whiteSpace = "nowrap";
      sp.style.fontSize = "14px";
      label.appendChild(sp);
      if (i < arr.length - 1) label.appendChild(document.createTextNode(" "));
    });

    label.className = isFound ? "name-visible" : "name-hidden";

  
    card.appendChild(img);
    card.appendChild(label);
    grid.appendChild(card);
  });
}



    const label = document.createElement("div");
    const display = anim.displayName || capitalize(anim.name);

    
    label.innerHTML = "";
    display.split(" ").forEach((w, i, arr) => {
      const sp = document.createElement("span");
      sp.className = "name-part";
      sp.textContent = w;
      sp.style.display = "inline-block";
      sp.style.whiteSpace = "nowrap";
      sp.style.fontSize = "14px";
      label.appendChild(sp);
      if (i < arr.length - 1) label.appendChild(document.createTextNode(" "));
    });

    label.className = isFound ? "name-visible" : "name-hidden";

}

function fitAllLabels() {
  
  requestAnimationFrame(() => {
    document.querySelectorAll(".card .name-visible, .card .name-hidden").forEach(fitLabel);
  });
}

function fitLabel(labelEl) {
 
  if (labelEl.classList.contains("name-hidden")) return;

  const parent = labelEl.parentElement; // .card
  if (!parent) return;

  const maxWidth = parent.clientWidth - 4; // margen de seguridad
  const parts = Array.from(labelEl.querySelectorAll(".name-part"));
  if (parts.length === 0) return;

  
  const widest = () => parts.reduce((a, b) =>
    (a.getBoundingClientRect().width > b.getBoundingClientRect().width ? a : b)
  );

  
  if (parts.length === 1) {
    labelEl.style.whiteSpace = "nowrap"; // no romper la única palabra
    let fs = getCurrentPxFont(parts[0]);
    while ((labelEl.scrollWidth > maxWidth) && fs > 9) {
      fs -= 1;
      parts[0].style.fontSize = fs + "px";
    }
    return;
  }

  
  let safety = 60; // corta bucles locos
  while ((labelEl.scrollWidth > maxWidth) && safety-- > 0) {
    const w = widest();
    let fs = getCurrentPxFont(w);
    if (fs <= 9) break;
    w.style.fontSize = (fs - 1) + "px";
  }
}

function getCurrentPxFont(el) {
  const s = el.style.fontSize || window.getComputedStyle(el).fontSize || "14px";
  return parseFloat(s);
}


function renderAllGrids() {
  const x = window.scrollX;
  const y = window.scrollY;

  for (const [key, cfg] of Object.entries(GAMES)) {
    renderGrid(cfg.list, foundByGame[key], `grid-${key}`);
  }
  updateResults();
  fitAllLabels();

 
  requestAnimationFrame(() => {
    window.scrollTo(x, y);
  });

  
  const totalFoundNow = Object.values(foundByGame).reduce((s, arr) => s + arr.length, 0);
  if (totalFoundNow === allAnimatronics.length) {
    stopTimer();
  }
}

function revealCharacter(anim) {
  const key = normalizeKey(anim.displayName || anim.name);
  const list = foundByGame[anim.game];
  if (list.includes(key)) return;


  list.push(key);
  lastCorrect = anim.displayName || anim.name;

 
  try {
    correctSound.currentTime = 0;
    correctSound.play();
  } catch {}


  renderGrid(GAMES[anim.game].list, list, `grid-${anim.game}`);

 
  updateResults();
  fitAllLabels();

  
  const totalFoundNow = Object.values(foundByGame).reduce((s, arr) => s + arr.length, 0);
  if (totalFoundNow === allAnimatronics.length) {
    stopTimer();
  }

 
  setTimeout(() => { lastCorrect = null; }, 100);
}


function updateResults() {
  const total = Object.values(GAMES).reduce((sum, cfg) => sum + cfg.list.length, 0);
  const count = Object.values(foundByGame).reduce((sum, arr) => sum + arr.length, 0);
  const results = document.getElementById("results");
  if (!results) return;
  results.textContent = count === total
    ? `${count} de ${total} — ¡Completed! 🎉`
    : `${count} / ${total} found`;
}

const correctSound = new Audio("sounds/correct.mp3");

document.getElementById("toggle-silhouettes")?.addEventListener("click", () => {
  showSilhouettes = !showSilhouettes;
  renderAllGrids();
});

const allAnimatronics = Object.entries(GAMES).flatMap(([game, cfg]) =>
  cfg.list.map(a => ({
    ...a,
    game,
    aliases: a.aliases || [a.displayName || a.name]
  }))
);

function preloadAll() {
  allAnimatronics.forEach(anim => { const im = new Image(); im.src = anim.img; });
}


document.getElementById("guess")?.addEventListener("input", (e) => {
  
  if (e.target.value.length > 0) startTimer();

  const input = normalize(e.target.value);
  if (!input) return;

  for (const anim of allAnimatronics) {
    const normalizedAliases = (anim.aliases || []).map(a => normalize(a));
    if (!normalizedAliases.includes(input)) continue;

   
    e.target.value = "";

    
    if (isMultiplayer) {
      const n = normalizeKey(anim.displayName || anim.name);
      update(ref(db, `rooms/${roomId}/found`), { [`${anim.game}-${n}`]: username });
    }

    
    revealCharacter(anim);
    break;
  }
});



document.addEventListener("contextmenu", e => {
  if (e.target.tagName === "IMG") e.preventDefault();
});


const pressedKeys = new Set();

document.addEventListener("keydown", (e) => {
  pressedKeys.add(e.key.toLowerCase());

  if (pressedKeys.has("c") && pressedKeys.has("a") && pressedKeys.has("w")) {
    allAnimatronics.forEach((anim, index) => {
      if (index === 0) return;
     
      if (isMultiplayer) {
        const n = normalizeKey(anim.displayName || anim.name);
        update(ref(db, `rooms/${roomId}/found`), { [`${anim.game}-${n}`]: username });
      }
      revealCharacter(anim);
    });
    console.log("CAWTHON ACCESS ;)");
  }
});

document.addEventListener("keyup", (e) => {
  pressedKeys.delete(e.key.toLowerCase());
});



if (isMultiplayer) {
  document.getElementById("ranking").style.display = "block";
  username = prompt("Type your name to make a temporary room, then send the link to a friend!")?.trim().substring(0, 20) || "Anonym";

  const createdId = localStorage.getItem("justCreatedRoom");
  if (createdId && createdId === roomId) {
    const now = new Date().toISOString();
    update(ref(db, `rooms/${roomId}`), { createdAt: now });
    localStorage.removeItem("justCreatedRoom");
  }

  foundRef = ref(db, `rooms/${roomId}/found`);
  playersRef = ref(db, `rooms/${roomId}/players`);

  onValue(foundRef, (snapshot) => {
    const data = snapshot.val() || {};
    Object.keys(foundByGame).forEach(k => (foundByGame[k] = []));
    let personalCount = 0;

    for (const key in data) {
      const idx = key.indexOf("-");
      if (idx <= 0) continue;
      const gameKey = key.slice(0, idx);
      const normalizedName = key.slice(idx + 1);
      if (!GAMES[gameKey]) continue;

      if (!foundByGame[gameKey].includes(normalizedName)) {
        foundByGame[gameKey].push(normalizedName);
      }
      if (data[key] === username) personalCount++;
    }

    update(ref(db, `rooms/${roomId}/players/${username}`), { count: personalCount });
    renderAllGrids();
  });

  onValue(playersRef, (snapshot) => {
    const data = snapshot.val() || {};
    const sorted = Object.entries(data).sort((a, b) => b[1].count - a[1].count);
    const ranking = sorted.map(([name, val]) => `<div>${name}: ${val.count}</div>`).join("");
    document.getElementById("ranking").innerHTML = `<h3>Ranking:</h3>${ranking}`;
  });
} else {
  const r = document.getElementById("ranking");
  if (r) r.style.display = "none";
}


createSections();
renderAllGrids();
preloadAll();

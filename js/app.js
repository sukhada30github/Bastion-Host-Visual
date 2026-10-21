(() => {
'use strict';
const C = {blue:'#3b82f6',teal:'#14b8a6',gold:'#f5b942',purple:'#8b5cf6',green:'#22c55e',red:'#ef4444',pink:'#f472b6',ink:'#e6edf8',mute:'#9fb0cc',sky:'#8db7ff',wire:'#60a5fa'};
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const r3 = x => +x.toFixed(3);
const $ = id => document.getElementById(id);
const svg = $('diagram'), reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const T = (x,y,s,o={}) => `<text x="${x}" y="${y}" font-size="${o.z||12}" fill="${o.c||C.ink}" text-anchor="${o.a||'start'}" font-weight="${o.w||500}"${o.m?' class="mono"':''}>${esc(s)}</text>`;
const R = (x,y,w,h,o={}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r==null?10:o.r}" fill="${o.f||'none'}"${o.o?` fill-opacity="${o.o}"`:''} stroke="${o.s||'none'}" stroke-width="${o.sw||1.5}"${o.d?` stroke-dasharray="${o.d}"`:''}/>`;
const keyShape = (f,s) => `<circle cx="-7" cy="0" r="6" fill="${f}" stroke="${s}" stroke-width="1.5"/><circle cx="-8" cy="0" r="1.8" fill="#0a1228"/><path d="M-1 0H12M8 0V5M12 0V4" stroke="${s}" stroke-width="3" stroke-linecap="round"/>`;
const G = {
  key:keyShape(C.gold,'#fde68a'), kPriv:keyShape('#f97316','#fdba74'), kPub:keyShape('#e2e8f0','#94a3b8'),
  env:`<rect x="-12" y="-8" width="24" height="16" rx="2" fill="${C.gold}"/><path d="M-12 -8L0 2 12 -8" fill="none" stroke="#6b4300" stroke-width="1.6"/>`,
  lock:`<path d="M-5 -3v-4a5 5 0 0 1 10 0v4" fill="none" stroke="#e6edf8" stroke-width="2.2"/><rect x="-8" y="-3" width="16" height="12" rx="2" fill="${C.green}" stroke="#fff" stroke-width="1.2"/>`,
  shield:`<path d="M0 -12L11 -8V2C11 8 5 12 0 14-5 12-11 8-11 2V-8Z" fill="#ec4899" stroke="#fff" stroke-width="1.5"/><path d="M-4 1l3 3 6-7" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>`,
  ok:`<circle r="11" fill="${C.green}"/><path d="M-5 0l3.5 4 7-8" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  bad:`<circle r="11" fill="${C.red}"/><path d="M-5 -5l10 10M5 -5l-10 10" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>`
};
const at = (x,y,g,sc=1) => `<g transform="translate(${x},${y}) scale(${sc})">${G[g]}</g>`;
const pk = (g,id,dur,a=0,b=1) => {
  a = r3(a); b = r3(b);
  const seq = a > 0 || b < 1;
  const m = `<animateMotion dur="${dur}s" repeatCount="indefinite"${seq?` calcMode="linear" keyPoints="0;0;1;1" keyTimes="0;${a};${b};1"`:''}><mpath href="#${id}"/></animateMotion>`;
  const v = seq ? `<animate attributeName="opacity" calcMode="discrete" values="0;1;0" keyTimes="0;${a};${b}" dur="${dur}s" repeatCount="indefinite"/>` : '';
  return `<g${seq?' opacity="0"':''}>${G[g]}${m}${v}</g>`;
};
const slice = (dur,a,b) => `<animate attributeName="opacity" calcMode="discrete" values="0;1;0" keyTimes="0;${r3(a)};${r3(b)}" dur="${dur}s" repeatCount="indefinite"/>`;
// show an element only from time a (fraction of the loop) onward
const from = (dur,a) => `<animate attributeName="opacity" calcMode="discrete" values="0;1" keyTimes="0;${r3(a)}" dur="${dur}s" repeatCount="indefinite"/>`;
const anim = () => !reduce.matches;

const tcol = l => l[0] === '#' ? C.mute : l[0] === '$' ? '#7ee0a3' : /^(Success|Authent|Accepted)/.test(l) ? C.green : C.ink;
function term(x,y,title,lines,ok) {
  const D = lines.length * .7 + 3;
  let h = R(x,y,340,186,{f:'#050a18',s:ok?C.green:'#2b3b63',r:8,sw:ok?2.5:1.5})+T(x+12,y+18,title,{c:C.mute});
  lines.forEach((l,i) => {
    const t = T(x+12,y+38+16*i,l,{m:1,c:tcol(l)+''});
    h += anim() ? `<g opacity="0">${t}${from(D,(i*.7+.2)/D)}</g>` : t;
  });
  return h;
}

const STEPS = [
 {t:'AWS VPC and Two EC2 Instances', s:'Reception and server room',
  plain:'Think of a building with a reception area (public subnet) and a restricted server room (private subnet). EC2 A is the receptionist who may talk to the outside world. EC2 B sits in the server room and has no public address.',
  tech:'One VPC in us-east-1 (N. Virginia) with a public subnet (route to an Internet Gateway) and a private subnet (no direct Internet route). EC2 A (Bastion Host, jump server) has a public IP. EC2 B (private target) has only a private IP. Both run Amazon Linux 2023.',
  watch:'The AWS Cloud, VPC and both subnets fade in, then the two instances appear: A on the left, B on the right.',
  tA:[], tB:[], cmds:[]},
 {t:'Understanding SSH', s:'The secure tunnel',
  plain:'SSH (Secure Shell) is a secure tunnel for typing commands on another computer. Everything inside the tunnel is scrambled so nobody on the way can read it. The tunnel enters through door number 22.',
  tech:'SSH is an encrypted remote-login protocol that listens on TCP port 22 by default. EC2 A runs the SSH client; the SSH daemon (sshd) on EC2 B is the server that accepts connections.',
  watch:'An envelope (connection request) travels from A toward the port 22 door on B.',
  tA:['# SSH = Secure Shell','# uses TCP port 22','# A is the client, B the server','$ ssh <user>@<private-ip>'],
  tB:['# sshd listens on TCP port 22','# waiting for connections'],
  cmds:[['ssh ec2-user@<PRIVATE_IP_OF_INSTANCE_B>','Basic form: user@address. Port 22 is used unless you add -p.']]},
 {t:'Understanding SSH Keys', s:'Lock and key',
  plain:'Instead of a password you use a matching pair: a private key (your personal secret) and a public key (an identity proof you can hand out). The server keeps a copy of your public key and checks that you hold the matching private key. Never share the private key.',
  tech:'Public-key authentication uses an asymmetric key pair. The private key never leaves its owner. The server stores only public keys and challenges the client to prove possession of the private key without sending it.',
  watch:'The two key files appear as distinct objects: an orange private key and a light public key.',
  tA:['# key pair = lock + key','# private key = personal secret','# public key = identity proof','# never share the private key'],
  tB:['# B stores PUBLIC keys only','# in ~/.ssh/authorized_keys'], cmds:[]},
 {t:'Generate SSH Keys', s:'Make a key pair on A',
  plain:'On the receptionist’s computer (EC2 A) we make a brand-new key pair. This creates two files in a hidden folder called .ssh: one secret, one shareable.',
  tech:'ssh-keygen -t ed25519 creates a NEW key pair on A: ~/.ssh/id_ed25519 (private) and ~/.ssh/id_ed25519.pub (public). This is different from the EC2 launch key pair chosen when you launch an instance: AWS stores only that key pair’s public half and you download its private .pem file once.',
  watch:'Two keys pop out of the terminal into the .ssh folder on A.',
  tA:['$ ssh-keygen -t ed25519','Generating public/private ed25519','Enter file in which to save the key','(/home/ec2-user/.ssh/id_ed25519):','Enter passphrase (empty = none):','Your identification has been saved','in /home/ec2-user/.ssh/id_ed25519','Your public key has been saved in','/home/ec2-user/.ssh/id_ed25519.pub'],
  tB:['# nothing changes on B yet','# B does not know A’s key'],
  cmds:[['ssh-keygen -t ed25519','Creates the key pair on A. Press Enter for the default file name and add a passphrase for extra protection.']]},
 {t:'View SSH Keys', s:'Look inside .ssh',
  plain:'Let’s look around. We find out where we are, list the files, step into the hidden .ssh folder and read the public key. We only ever read the public key. The private key is never printed.',
  tech:'~/.ssh must be private to the owner (700), the private key 600, the public key 644. The .pub file holds one line: key type, key data and a comment.',
  watch:'Each command appears in the terminal in order, ending with the public key line.',
  tA:['$ pwd','/home/ec2-user','$ ls -la','drwx------  .ssh','$ cd ~/.ssh','$ ls -la','-rw-------  id_ed25519','-rw-r--r--  id_ed25519.pub','$ cat ~/.ssh/id_ed25519.pub','ssh-ed25519 AAAAC3Nz… ec2-user@bastion'],
  tB:['# B is unchanged','# (private key is never printed)'],
  cmds:[['pwd','Print working directory: shows where you are (usually /home/ec2-user).'],['ls -la','List all files, including hidden ones, with permissions and owners.'],['cd ~/.ssh','Move into the hidden SSH folder in your home directory.'],['ls -la','Now you should see id_ed25519 (private, -rw-------) and id_ed25519.pub (public).'],['cat ~/.ssh/id_ed25519.pub','Print the PUBLIC key only. Never run cat on the private key.']]},
 {t:'Authorize the Public Key', s:'Add to the approved list',
  plain:'EC2 B only lets in visitors on its approved list. We copy only the public key from A and add it to B’s list (the authorized_keys file). The private key stays on A and is never copied anywhere.',
  tech:'B must already be reachable through an authorized administrative path: its EC2 launch key pair, EC2 Instance Connect or Session Manager. Append the public key line to ~/.ssh/authorized_keys on B. Permissions: ~/.ssh 700, authorized_keys 600, both owned by ec2-user. (ssh-copy-id automates this when you already have access.)',
  watch:'A light public key travels from A to B’s authorized_keys. The private key stays put.',
  tA:['$ cat ~/.ssh/id_ed25519.pub','ssh-ed25519 AAAAC3Nz… ec2-user@bastion','# copy this PUBLIC line only','# send it via an already-authorized','#  path: launch key pair, EC2','#  Instance Connect or SSM'],
  tB:['$ mkdir -p ~/.ssh','$ chmod 700 ~/.ssh','$ echo \'<PUBLIC_KEY_LINE>\' >> \\','    ~/.ssh/authorized_keys','$ chmod 600 ~/.ssh/authorized_keys','$ ls -l ~/.ssh/authorized_keys','-rw------- 1 ec2-user ec2-user …'],
  cmds:[['cat ~/.ssh/id_ed25519.pub','On A: show the public key line to copy.'],['mkdir -p ~/.ssh && chmod 700 ~/.ssh','On B: create the folder; only the owner may enter it.'],['echo \'<PUBLIC_KEY_LINE>\' >> ~/.ssh/authorized_keys','On B: append A’s PUBLIC key as one line. Never paste a private key.'],['chmod 600 ~/.ssh/authorized_keys','On B: only the owner may read and write the file.'],['ls -l ~/.ssh/authorized_keys','On B: owner and group should both be ec2-user. If not: sudo chown -R ec2-user:ec2-user ~/.ssh']]},
 {t:'Configure Security Groups', s:'Post the guards',
  plain:'Each instance has a security guard. The guard at B only lets in SSH visitors who come from A’s guard group. We never leave B’s port 22 open to the whole Internet.',
  tech:'Private SG inbound: SSH, TCP 22, source = the Bastion SG (security group reference). Bastion SG inbound: SSH, TCP 22, source = your admin IP (/32). Security groups are stateful, so replies are allowed automatically. NACLs and routes must also allow the path.',
  watch:'Guards appear at both instances, with a rule chip under each. A request and then an encrypted session reach B through its guard.',
  tA:['# Bastion SG inbound:','#  SSH 22 from your IP only','# (avoid 0.0.0.0/0)'],
  tB:['# Private SG inbound:','#  SSH 22 from Bastion SG','# never open 22 to the Internet'],
  cmds:[['aws ec2 authorize-security-group-ingress --group-id <PRIVATE_SG_ID> --protocol tcp --port 22 --source-group <BASTION_SG_ID> --region us-east-1','Allow SSH into the private SG only from the bastion SG. The console does the same under Security Groups → Inbound rules.']]},
 {t:'Connect EC2 A to EC2 B', s:'Walk through the tunnel',
  plain:'From the receptionist’s computer we knock on B’s door with our key. B checks its approved list, sees our public key, and lets us in. We are now typing commands on B through a secure tunnel.',
  tech:'Run on A: ssh -i ~/.ssh/id_ed25519 ec2-user@<private IP of B>. It works only if A has a network path to B (same VPC local route, security groups and NACLs allowing TCP 22) and SSH permissions are right (public key in B’s authorized_keys, private key 600 on A).',
  watch:'Request, key, success checkmark, then a lock travels through the green encrypted tunnel. The terminal prints the success message.',
  tA:['$ ssh -i ~/.ssh/id_ed25519 \\','    ec2-user@<PRIVATE_IP_OF_INSTANCE_B>','Authenticated with public key','[ec2-user@ip-10-0-2-25 ~]$','Successfully connected to EC2 Instance B'],
  tB:['Accepted publickey for ec2-user','from 10.0.1.10 port 51822','session opened (encrypted)'],
  cmds:[['ssh -i ~/.ssh/id_ed25519 ec2-user@<PRIVATE_IP_OF_INSTANCE_B>','Connect from A to B using the private key on A. Replace the placeholder with B’s private IP.'],['ssh -v -i ~/.ssh/id_ed25519 ec2-user@<PRIVATE_IP_OF_INSTANCE_B>','Same, with verbose output: shows which keys are tried and where it fails.'],['exit','Close the SSH session and return to EC2 A.']]},
 {t:'Verify and Troubleshoot', s:'Prove it works, fix it',
  plain:'Prove you are on the right machine by asking who you are and what the machine is called. If the door stays shut, work through the checklist: guard, road, key, name.',
  tech:'whoami should print ec2-user, hostname and hostname -I should show B’s name and private IP (10.0.2.x). For failures, use ssh -v on A and the table below.',
  watch:'First a request is blocked by the guard (red cross, timed out). Then the key is refused (permission denied). After the fixes, a green connection succeeds.',
  tA:['# Troubleshoot in order:','1 SG on B allows 22 from A’s SG','2 route / NACL path A → B','3 ssh -v -i KEY USER@IP','4 chmod 600 ~/.ssh/id_ed25519','5 user is ec2-user','6 key line is in authorized_keys'],
  tB:['$ whoami','ec2-user','$ hostname','ip-10-0-2-25.ec2.internal','$ hostname -I','10.0.2.25'],
  cmds:[['whoami','Prints the current user. Expect ec2-user.'],['hostname','Prints the machine name. Expect B’s name, not A’s.'],['hostname -I','Prints the private IP address(es). Expect B’s IP (10.0.2.x).'],['chmod 600 ~/.ssh/id_ed25519','On A: fix “UNPROTECTED PRIVATE KEY FILE” errors.'],['sudo systemctl status sshd','On B: check that the SSH daemon is running (for “connection refused”).']],
  trouble:[['Permission denied (publickey)','B does not accept the key: wrong or missing public key in authorized_keys, wrong user, or wrong private key file.'],['Connection timed out','No network path: B’s security group does not allow TCP 22 from A’s SG, or a route table or NACL blocks it, or the IP is wrong.'],['Connection refused','B is reachable but nothing listens on port 22: start sshd or check the port.'],['Incorrect username','Amazon Linux 2023 uses ec2-user. Ubuntu uses ubuntu, Debian uses admin.'],['Incorrect private key permissions','“UNPROTECTED PRIVATE KEY FILE”: run chmod 600 ~/.ssh/id_ed25519 and chmod 700 ~/.ssh.'],['Missing public key in authorized_keys','Append A’s public key to ~/.ssh/authorized_keys on B and set permissions 700 / 600 (step 6).']]}
];

// ----- diagram elements (bg = drawn before wires) -----
const EL = [
 {s:1,bg:1,f:()=>R(15,15,1070,590,{s:C.blue,f:C.blue,o:.07,r:18})+T(35,42,'AWS Cloud · Region us-east-1 (N. Virginia)',{c:C.sky,w:800,z:15})
   +R(40,60,1020,520,{s:C.teal,f:C.teal,o:.07,r:14,d:'8 6'})+T(55,84,'VPC 10.0.0.0/16',{c:'#5eead4',w:700})
   +R(70,105,440,450,{s:C.gold,f:C.gold,o:.08})+T(85,128,'Public subnet 10.0.1.0/24 · reception area',{c:C.gold})
   +R(580,105,450,450,{s:C.purple,f:C.purple,o:.1})+T(595,128,'Private subnet 10.0.2.0/24 · restricted server room',{c:'#c4b0ff'})},
 {s:1,f:c=>R(100,168,370,337,{s:C.gold,f:'#101b33',r:14,sw:2.5})+T(115,190,'EC2 A · Bastion Host (jump server)',{w:800,z:14,c:'#fcd34d'})+T(115,208,'Amazon Linux 2023 · 10.0.1.10',{c:C.mute})
   +R(630,168,370,337,{s:C.purple,f:'#141632',r:14,sw:2.5})+T(645,190,'EC2 B · Private Target Server',{w:800,z:14,c:'#c4b0ff'})+T(645,208,'Amazon Linux 2023 · 10.0.2.25 (private)',{c:C.mute})
   +(c===1?T(115,300,'Has a public IP and sits in',{c:C.mute})+T(115,318,'the reception area',{c:C.mute})+T(645,300,'Has no public IP and sits in',{c:C.mute})+T(645,318,'the restricted server room',{c:C.mute}):'')},
 {s:2,f:c=>term(115,220,'Terminal · EC2 A (bastion)',STEPS[c-1].tA,c===8)+term(645,220,'Terminal · EC2 B (private)',STEPS[c-1].tB,c===8||c===9)
   +`<circle cx="630" cy="240" r="13" fill="${C.gold}" stroke="#fff" stroke-width="1.5"/>`+T(630,245,'22',{a:'middle',w:800,c:'#3a2d10'})+T(550,250,'TCP 22 · SSH door',{a:'middle',c:C.gold})},
 {s:3,f:c=>R(115,414,340,86,{s:'#3b4a78',f:'#0a1228',r:8})+T(445,432,c<4?'lock + key (example)':'~/.ssh/ on EC2 A',{a:'end',c:C.mute})
   +`<g${c===4&&anim()?' opacity="0"':''}>${at(135,452,'kPriv')}${T(118,474,'id_ed25519')}${T(118,490,'private · secret',{c:'#fdba74'})}${c===4&&anim()?from(8,.45):''}</g>`
   +`<g${c===4&&anim()?' opacity="0"':''}>${at(300,452,'kPub')}${T(283,474,'id_ed25519.pub')}${T(283,490,'public · shareable',{c:'#bae6fd'})}${c===4&&anim()?from(8,.65):''}</g>`},
 {s:6,f:c=>R(645,414,340,86,{s:'#3b4a78',f:'#0a1228',r:8})+T(657,432,'authorized_keys · approved visitor list',{c:C.mute})
   +`<g${c===6&&anim()?' opacity="0"':''}>${T(657,474,'ssh-ed25519 AAAAC3Nz… ec2-user@bastion',{m:1,c:'#bae6fd',z:11})}${T(657,490,'perms: ~/.ssh 700 · file 600',{c:C.mute})}${c===6&&anim()?from(8,.5):''}</g>`
   +(c===6?T(550,436,'public key only',{a:'middle',c:'#fbbf24'})+T(550,486,'Private key',{a:'middle',c:'#fda4af',w:700})+T(550,502,'never leaves A',{a:'middle',c:'#fda4af'}):'')},
 {s:7,f:()=>R(85,140,400,375,{s:C.pink,d:'9 6',r:14,sw:2})+T(100,158,'Security Group · guard',{c:C.pink,w:700})+at(468,152,'shield')
   +R(615,140,400,375,{s:C.pink,d:'9 6',r:14,sw:2})+T(630,158,'Security Group · guard',{c:C.pink,w:700})+at(998,152,'shield')
   +R(85,526,400,24,{s:C.pink,f:'#3a1230',r:12})+T(97,543,'Bastion SG · SSH 22 from your IP only',{c:C.pink})
   +R(615,526,400,24,{s:C.pink,f:'#3a1230',r:12})+T(627,543,'Private SG · SSH 22 from Bastion SG only',{c:C.pink})},
 {s:8,f:()=>T(550,382,'encrypted tunnel',{a:'middle',c:C.green,w:700})}
];

// dashed wires: [id, d, colour, fromStep, toStep]
const GR = '#34d399';
const WR = [
 ['pReq','M470 270 L630 270',C.wire,2,9],['pG1','M135 410 L135 446',null,4,4],['pG2','M300 410 L300 446',null,4,4],
 ['pKey','M314 452 L662 452','#fbbf24',6,6],['pAuth','M470 300 L630 300',C.gold,8,9],['pBack','M630 330 L470 330',GR,8,9],['pTun','M470 360 L630 360',GR,8,9],
 ['pBlk','M470 270 L600 270',null,9,9],['pBlk2','M470 270 L632 270',null,9,9]
];
const STARS = [[80,35],[260,28],[420,590],[700,32],[1075,300],[30,330],[880,598],[560,598]];
const DEFS = '<defs><pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#27386b"/></pattern></defs><rect width="1100" height="620" fill="#0a1228"/><rect width="1100" height="620" fill="url(#dots)"/>'
  + STARS.map(([x,y],i) => `<circle cx="${x}" cy="${y}" r="2" fill="#9cc2ff"><animate attributeName="opacity" values=".15;.9;.15" dur="${3+i%3}s" repeatCount="indefinite"/></circle>`).join('');

function packets() {
  switch (step) {
    case 2: return pk('env','pReq',4);
    case 4: return pk('key','pG1',8,.15,.45)+pk('key','pG2',8,.4,.7);
    case 6: return pk('kPub','pKey',8,.1,.5);
    case 7: return pk('env','pReq',6,0,.5)+pk('lock','pReq',6,.5,1);
    case 8: return pk('env','pReq',4,0,.2)+pk('key','pAuth',4,.2,.4)+pk('ok','pBack',4,.4,.6)+pk('lock','pTun',4,.6,1);
    case 9: {
      const D = 16, X = (x,a,b) => `<g transform="translate(${x},270)" opacity="0">${G.bad}${slice(D,a,b)}</g>`;
      const L = (t1,t2,col,a,b) => `<g opacity="0">${T(550,214,t1,{a:'middle',c:col,w:700})}${t2?T(550,228,t2,{a:'middle',c:col,w:700}):''}${slice(D,a,b)}</g>`;
      return pk('env','pBlk',D,0,.12)+X(608,.12,.3)+L('Connection','timed out','#ff8a8a',.12,.3)
        +pk('env','pBlk2',D,.32,.4)+X(642,.4,.5)+L('Permission denied','(publickey)','#ff8a8a',.4,.5)
        +pk('env','pReq',D,.52,.62)+pk('key','pAuth',D,.62,.72)+pk('ok','pBack',D,.72,.84)+L('Connected ✔','',C.green,.52,.95)+pk('lock','pTun',D,.84,1);
    }
    default: return '';
  }
}

let step = 1, timer = null;
function render() {
  let h = DEFS;
  const vis = EL.filter(e => e.s <= step), g = e => `<g class="el${e.s === step ? ' new' : ''}">${e.f(step)}</g>`;
  vis.filter(e => e.bg).forEach(e => { h += g(e); });
  WR.filter(w => w[3] <= step && step <= w[4]).forEach(w => {
    h += `<path id="${w[0]}" d="${w[1]}" fill="none" stroke="${w[2] || 'none'}" stroke-width="2.5" stroke-dasharray="7 6" opacity=".75"><animate attributeName="stroke-dashoffset" values="26;0" dur="1.3s" repeatCount="indefinite"/></path>`; });
  vis.filter(e => !e.bg).forEach(e => { h += g(e); });
  h += packets();
  svg.innerHTML = h; svg.setCurrentTime(0);
  if (reduce.matches) { svg.pauseAnimations(); svg.setCurrentTime(1.5); } else svg.unpauseAnimations();
  const s = STEPS[step - 1];
  $('cTitle').textContent = `Step ${step} · ${s.t}`; $('cPlain').textContent = s.plain; $('cTech').textContent = s.tech; $('cWatch').textContent = s.watch;
  $('count').textContent = `Step ${step} of ${STEPS.length}`;
  document.querySelectorAll('.sb').forEach((b,i) => i + 1 === step ? b.setAttribute('aria-current','step') : b.removeAttribute('aria-current'));
  $('prev').disabled = step === 1; $('next').disabled = step === STEPS.length;
  renderCmds(s);
}
async function copy(text,btn) {
  try { await navigator.clipboard.writeText(text); }
  catch (e) { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (_) {} ta.remove(); }
  const o = btn.textContent; btn.textContent = 'Copied ✓'; setTimeout(() => { btn.textContent = o; }, 1500);
}
function renderCmds(s) {
  const box = $('cmds'); box.textContent = '';
  (s.cmds || []).forEach(([c,w]) => {
    const d = document.createElement('div'); d.className = 'cmd';
    const code = document.createElement('code'); code.textContent = c;
    const b = document.createElement('button'); b.type = 'button'; b.textContent = 'Copy'; b.setAttribute('aria-label','Copy command: ' + c); b.onclick = () => copy(c,b);
    const p = document.createElement('p'); p.textContent = w;
    d.append(code,b,p); box.appendChild(d);
  });
  const tb = $('trouble'); tb.textContent = '';
  (s.trouble || []).forEach(([a,b]) => { const tr = document.createElement('tr'), t1 = document.createElement('td'), t2 = document.createElement('td'); t1.textContent = a; t2.textContent = b; tr.append(t1,t2); tb.appendChild(tr); });
  $('troubleBox').hidden = !(s.trouble || []).length;
  $('cmdCard').hidden = !(s.cmds || []).length;
}
function go(n) { step = Math.max(1, Math.min(STEPS.length, n)); render(); }
function stop() { clearInterval(timer); timer = null; $('auto').setAttribute('aria-pressed','false'); $('auto').textContent = '▶ Auto-play (5s)'; }
function play() {
  if (step === STEPS.length) go(1);
  $('auto').setAttribute('aria-pressed','true'); $('auto').textContent = '⏸ Pause';
  timer = setInterval(() => { if (step < STEPS.length) go(step + 1); if (step === STEPS.length) stop(); }, 5000);
}
STEPS.forEach((s,i) => {
  const li = document.createElement('li'), b = document.createElement('button');
  b.type = 'button'; b.className = 'sb';
  b.innerHTML = `<span class="n">${i + 1}</span><span><b>${esc(s.t)}</b><small>${esc(s.s)}</small></span>`;
  b.addEventListener('click', () => go(i + 1)); li.appendChild(b); $('steps').appendChild(li);
});
const LEG = [['key','Key','SSH authentication'],['env','Envelope','connection request'],['lock','Lock','encrypted SSH session'],['shield','Shield','Security Group'],['ok','Checkmark','successful login'],['bad','Red cross','rejected connection'],['kPriv','Private key','secret, stays on A'],['kPub','Public key','safe to share']];
$('legend').innerHTML = LEG.map(l => `<span><svg width="30" height="26" viewBox="-16 -14 32 28" aria-hidden="true">${G[l[0]]}</svg><b>${l[1]}</b> = ${l[2]}</span>`).join('');
$('prev').onclick = () => go(step - 1); $('next').onclick = () => go(step + 1);
$('reset').onclick = () => { stop(); go(1); };
$('auto').onclick = () => timer ? stop() : play();
document.addEventListener('keydown', e => {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.key === 'ArrowRight') go(step + 1); else if (e.key === 'ArrowLeft') go(step - 1);
  else if (e.key === 'Home') go(1); else if (e.key === 'End') go(STEPS.length);
});
const root = document.documentElement;
root.dataset.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
$('theme').onclick = () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; };
render();
})();

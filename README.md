# bastion-host

An animated, beginner-friendly, interactive diagram that explains **SSH key-based authentication between two AWS EC2 instances**: a Bastion Host (jump server) in a public subnet and a private target server in a private subnet, in AWS Region **us-east-1 (N. Virginia)**.

**#Buildwithsukhada**

Pure HTML, CSS and JavaScript. No build step, no JavaScript dependencies. Works on GitHub Pages.

## The story
| Real thing | Analogy |
|---|---|
| EC2 Instance A | Bastion Host / jump server (the receptionist) |
| EC2 Instance B | Private target server (in the server room) |
| SSH | Secure communication tunnel |
| Private key | Personal secret key |
| Public key | Registered identity proof |
| `authorized_keys` | Approved visitor list |
| Security Group | Security guard |
| Port 22 | SSH entrance |
| Public subnet | Reception area |
| Private subnet | Restricted server room |

## Nine learning steps
1. **AWS VPC and two EC2 instances** – public and private subnet, A and B.
2. **Understanding SSH** – Secure Shell and TCP port 22.
3. **Understanding SSH keys** – private key vs public key (lock and key).
4. **Generate SSH keys** – `ssh-keygen -t ed25519` on A.
5. **View SSH keys** – `pwd`, `ls -la`, `cd ~/.ssh`, `ls -la`, `cat ~/.ssh/id_ed25519.pub`.
6. **Authorize the public key** – add only A’s public key to B’s `~/.ssh/authorized_keys`.
7. **Configure Security Groups** – B allows TCP 22 only from A’s security group.
8. **Connect EC2 A to EC2 B** – `ssh -i ~/.ssh/id_ed25519 ec2-user@<PRIVATE_IP_OF_INSTANCE_B>`.
9. **Verify and troubleshoot** – `whoami`, `hostname`, `hostname -I` and common errors.

## SSH command reference
```bash
ssh-keygen -t ed25519                         # on A: create a NEW key pair
pwd && ls -la                                 # where am I, what is here
cd ~/.ssh && ls -la                           # look at the key files
cat ~/.ssh/id_ed25519.pub                     # print the PUBLIC key only

mkdir -p ~/.ssh && chmod 700 ~/.ssh           # on B
echo '<PUBLIC_KEY_LINE>' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
sudo chown -R ec2-user:ec2-user ~/.ssh        # only if ownership is wrong

ssh -i ~/.ssh/id_ed25519 ec2-user@<PRIVATE_IP_OF_INSTANCE_B>     # on A
ssh -v -i ~/.ssh/id_ed25519 ec2-user@<PRIVATE_IP_OF_INSTANCE_B>  # verbose
whoami; hostname; hostname -I                 # on B: verify
chmod 600 ~/.ssh/id_ed25519                   # fix key permission errors
sudo systemctl status sshd                    # on B: is sshd running?
aws ec2 authorize-security-group-ingress --group-id <PRIVATE_SG_ID> \
  --protocol tcp --port 22 --source-group <BASTION_SG_ID> --region us-east-1
```
**New key pair vs EC2 launch key pair:** `ssh-keygen` creates a new pair on A. The EC2 launch key pair is chosen when launching an instance; AWS keeps only its public half and you download the private `.pem` once. Use a launch key pair or EC2 Instance Connect / Session Manager as the already-authorized path to put A’s public key on B.

## Security recommendations
- Keep the private key only on the machine that generated it. Never copy it between instances, paste it into chats or commit it to Git.
- Never print the private key (`cat ~/.ssh/id_ed25519`). Only the `.pub` file is shareable.
- Permissions: `~/.ssh` 700, private key 600, `authorized_keys` 600.
- Add a passphrase to the private key.
- Allow SSH on the private server only from the bastion’s security group. Allow the bastion only from your admin IP, not `0.0.0.0/0`.
- Consider AWS Systems Manager Session Manager or EC2 Instance Connect Endpoint to avoid a public bastion.
- Network path: the bastion must reach the private instance (VPC local route, security groups and NACLs allowing TCP 22).

## Controls
Click a step, use Previous/Next, Auto-play (5 s), Reset, the dark/light toggle, copy buttons on commands, or the **←  →  Home  End** keys. Reduced-motion settings pause the animation.

## Run locally
```bash
cd bastion-host
python3 -m http.server 8000   # open http://localhost:8000
```

## Deploy on GitHub Pages
1. Push the folder contents to a GitHub repository (`.nojekyll` is included).
2. Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.
3. Open `https://<your-username>.github.io/<repo-name>/`.

## Project structure
```
bastion-host/
  index.html      layout, controls, caption and command cards
  css/style.css   themes, responsive layout, glow animation
  js/app.js       step data, SVG helpers, rendering, copy buttons
  .nojekyll
  LICENSE         MIT
  README.md
```

## Customise
Edit `STEPS` (text, terminal lines `tA`/`tB`, commands `cmds`, `trouble`) and `EL` (diagram components) in `js/app.js`. Moving objects are `pk(glyph, pathId, seconds, from, to)` calls in `packets()`.

#Buildwithsukhada · MIT License

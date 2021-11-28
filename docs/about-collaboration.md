# About collaboration

This document is only for group members, please use pull request instead if you are not a group member of Cocoloring team.

## 1. Prepare SSH keys for authentication

### 1.1. Generate SSH keys

```bash
ssh-keygen -t ed25519 -C "cocoloring@outlook.com"
```

### 1.2. Add SSH private key into your SSH configuration file

```properties
Host cocoloring.github.com
  HostName github.com
  User git
  IdentityFile "<path_to_private_key>"
```

### 1.3. Send your public key

```plaintext
title: Update SSH key
to: cocoloring@outlook.com
---
Hey my new key below. ;)
---
ssh-ed25519 <key> cocoloring@outlook.com
```

## 2. Clone repository via https

```bash
git clone https://github.com/cocoloring/jigenlab.git
```

## 3. Overwrite local configurations

```bash
cd jigenlab # directory of git repository
cp settings/git/config .git/config # overwrite the file
```

## 4. Be a code slave

Maybe buy some red bull.

#!/usr/bin/env python3
"""
SFTP deploy script — uploads dist/ to Hostinger public_html.
Uses paramiko with explicit timeouts to prevent hanging.
"""
import os
import sys
import paramiko
from pathlib import Path

HOSTNAME  = os.environ['SFTP_HOST']
USERNAME  = os.environ['SFTP_USER']
PASSWORD  = os.environ['SFTP_PASS']
LOCAL_DIR = Path('./dist')
REMOTE_DIR = '/public_html'

def ensure_remote_dir(sftp, path):
    """Create remote directory if it doesn't exist."""
    try:
        sftp.stat(path)
    except FileNotFoundError:
        print(f"  mkdir {path}")
        sftp.mkdir(path)

print(f"Connecting to {HOSTNAME}:22 ...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(
    hostname=HOSTNAME,
    port=22,
    username=USERNAME,
    password=PASSWORD,
    timeout=30,
    banner_timeout=30,
    auth_timeout=30,
)
print("Connected.")

sftp = client.open_sftp()

# Walk local dist/ and upload everything
for local_path in sorted(LOCAL_DIR.rglob('*')):
    relative    = local_path.relative_to(LOCAL_DIR)
    remote_path = REMOTE_DIR + '/' + str(relative).replace('\\', '/')

    if local_path.is_dir():
        ensure_remote_dir(sftp, remote_path)
    else:
        # Ensure parent directory exists
        ensure_remote_dir(sftp, os.path.dirname(remote_path))
        print(f"  put {remote_path}")
        sftp.put(str(local_path), remote_path)

sftp.close()
client.close()
print("Deploy complete.")

import requests
import os
import pandas as pd
import time

# ─── Config ───────────────────────────────────────────

BACKEND_URL = "http://localhost:3000"

FMA_AUDIO = r"C:\Users\ASUS\coding\projects\Music app\fma\fma_small\fma_small"
FMA_METADATA = r"C:\Users\ASUS\coding\projects\Music app\fma\fma_metadata\fma_metadata"

# Change these before each run
START_INDEX = 300
END_INDEX = 400
ALBUM_NAME = "album4"


# ─── Login ────────────────────────────────────────────

def login():
    print("🔐 Logging in...")

    email = input("Artist email: ")
    password = input("Artist password: ")

    session = requests.Session()

    response = session.post(
        f"{BACKEND_URL}/api/auth/login",
        json={
            "email": email,
            "password": password
        }
    )

    if response.status_code != 200:
        raise Exception(
            f"Login failed ({response.status_code}):\n{response.text}"
        )

    cookies = session.cookies.get_dict()

    print("✅ Login successful")
    print("🍪 Cookies:", cookies)

    if not cookies:
        raise Exception(
            "Login succeeded but no authentication cookie was returned."
        )

    return session


# ─── Load FMA Metadata ────────────────────────────────

def load_metadata():

    tracks_csv = os.path.join(
        FMA_METADATA,
        "tracks.csv"
    )

    print("📄 Loading FMA metadata...")

    tracks = pd.read_csv(
        tracks_csv,
        header=[0, 1],
        index_col=0,
        low_memory=False
    )

    metadata = {}

    for track_id, row in tracks.iterrows():

        try:
            title = row[("track", "title")]

            if pd.isna(title):
                continue

            metadata[int(track_id)] = {
                "title": str(title)
            }

        except Exception:
            continue

    print(f"✅ Loaded metadata for {len(metadata)} tracks")

    return metadata


# ─── Collect MP3 Files ────────────────────────────────

def collect_mp3s(metadata):

    print("\n📂 Scanning FMA Small...")

    files = []

    for root, _, filenames in os.walk(FMA_AUDIO):

        filenames.sort()

        for fname in filenames:

            if not fname.lower().endswith(".mp3"):
                continue

            try:
                track_id = int(fname.replace(".mp3", ""))
            except ValueError:
                continue

            if track_id not in metadata:
                continue

            files.append({
                "path": os.path.join(root, fname),
                "track_id": track_id,
                "title": metadata[track_id]["title"]
            })

    print(f"✅ Found {len(files)} MP3 files")

    return files


# ─── Upload Song ──────────────────────────────────────

def upload_song(session, file_info):

    with open(file_info["path"], "rb") as f:

        response = session.post(
            f"{BACKEND_URL}/api/music/upload",
            data={
                "title": file_info["title"],
                "album_name": ALBUM_NAME
            },
            files={
                "file": (
                    os.path.basename(file_info["path"]),
                    f,
                    "audio/mpeg"
                )
            },
            timeout=120
        )

    return response


# ─── Main Seeder ──────────────────────────────────────

def seed():

    session = login()

    metadata = load_metadata()

    files = collect_mp3s(metadata)

    if not files:
        print("❌ No MP3 files found")
        return

    to_upload = files[START_INDEX:END_INDEX]

    print()
    print(f"🎵 Album Name : {ALBUM_NAME}")
    print(f"🎵 Song Range : {START_INDEX} → {END_INDEX}")
    print(f"🚀 Uploading {len(to_upload)} songs")
    print("-" * 60)

    success_count = 0
    failed_count = 0
    failed_songs = []

    for i, file_info in enumerate(to_upload, start=1):

        try:

            response = upload_song(
                session,
                file_info
            )

            if response.status_code == 401:

                print("\n⚠️ Session expired. Re-logging in...")

                session = login()

                response = upload_song(
                    session,
                    file_info
                )

            if response.status_code in (200, 201):

                try:
                    data = response.json()
                except Exception:
                    data = {}

                music_id = (
                    data.get("music", {})
                    .get("music_id")
                )

                success_count += 1

                print(
                    f"[{i:03d}/{len(to_upload)}] "
                    f"✅ {file_info['title'][:50]} "
                    f"(music_id={music_id})"
                )

            else:

                failed_count += 1
                failed_songs.append(
                    file_info["title"]
                )

                print(
                    f"[{i:03d}/{len(to_upload)}] "
                    f"❌ HTTP {response.status_code}"
                )

                print(response.text)

        except Exception as e:

            failed_count += 1

            failed_songs.append(
                file_info["title"]
            )

            print(
                f"[{i:03d}/{len(to_upload)}] "
                f"❌ {file_info['title'][:50]}"
            )

            print(f"    Error: {e}")

        time.sleep(0.1)

    print("\n" + "=" * 60)

    print("🎉 Upload complete")
    print(f"✅ Success: {success_count}")
    print(f"❌ Failed : {failed_count}")

    if failed_songs:

        print("\nFailed songs:")

        for song in failed_songs:
            print(f" - {song}")

    print("\n⏳ ML indexing continues in the background.")
    print("Wait a few minutes before testing semantic search.")


if __name__ == "__main__":
    seed()
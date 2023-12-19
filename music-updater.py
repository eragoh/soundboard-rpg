import os
import json

# Ścieżki relatywne
music_dir = '.'  # Obecny katalog
script_file = 'script.js'

# Katalogi do zignorowania
ignore_dirs = {'__pycache__', '.git'}

# Znajdowanie kategorii i playlist
music_structure = {}
playlists = {}

# Przetwarzanie każdego folderu jako kategorii
for category in os.listdir(music_dir):
    if category in ignore_dirs:
        continue

    category_path = os.path.join(music_dir, category)
    if os.path.isdir(category_path):
        music_structure[category] = []

        # Dodawanie plików MP3 do kategorii i przetwarzanie playlist
        for item in os.listdir(category_path):
            item_path = os.path.join(category_path, item)
            if os.path.isfile(item_path) and item.endswith('.mp3'):
                music_structure[category].append(item)
            elif os.path.isdir(item_path):  # Obsługa playlist
                playlist_name = item
                playlists[playlist_name] = []
                music_structure[category].append(playlist_name)
                for song in os.listdir(item_path):
                    if song.endswith('.mp3'):
                        song_path = f"{category}/{playlist_name}/{song}"
                        playlists[playlist_name].append(song_path)

# Aktualizacja pliku script.js
with open(script_file, 'r') as file:
    content = file.readlines()

new_content = []
music_structure_str = 'const musicStructure = ' + json.dumps(music_structure, indent=4) + ';\n\n'
playlists_str = 'const playlists = ' + json.dumps(playlists, indent=4) + ';\n\n'

in_music_structure_section = False
in_playlists_section = False

for line in content:
    if 'const musicStructure =' in line:
        in_music_structure_section = True
        new_content.append(music_structure_str)
    elif in_music_structure_section and line.strip() == '};':
        in_music_structure_section = False
    elif 'const playlists =' in line:
        in_playlists_section = True
        new_content.append(playlists_str)
    elif in_playlists_section and line.strip() == '};':
        in_playlists_section = False
    elif not in_music_structure_section and not in_playlists_section:
        new_content.append(line)

with open(script_file, 'w') as file:
    file.writelines(new_content)

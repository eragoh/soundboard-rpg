var currentAudio = null;

const musicStructure = {
    "ambient": [
        "city",
        "dwarf music",
        "requiem",
        "szanty",
        "Tavern",
        "Warhammer Relaxing Ambient"
    ],
    "specials": [
        "Altdorf.mp3",
        "ConquestOfParadise.mp3",
        "epic-fight.mp3",
        "Geldern Night.mp3",
        "HeartShapedBox.mp3",
        "Morrs Gardens.mp3",
        "NobbySong.mp3",
        "Something in the Way+rain.mp3",
        "SwampBlues.mp3",
        "The Lonely Road.mp3",
        "Under City Walls.mp3",
        "Znowu Pada Deszcz.mp3"
    ],
    "themes": [
        "Arabella-JokesOnYou.mp3",
        "Artur-CarryOnWayward.mp3",
        "Artur-Underdog.mp3",
        "Artur-WaywardHeavenChoir.mp3",
        "Odred-Berserk.mp3",
        "Odred-Chinese.mp3",
        "Otmar-Immigrant.mp3"
    ]
};






const playlists = {
    "city": [
        "ambient/city/City-RAIN.mp3",
        "ambient/city/City1.mp3",
        "ambient/city/City2.mp3",
        "ambient/city/City3.mp3"
    ],
    "dwarf music": [
        "ambient/dwarf music/diggy-diggy-hole.mp3",
        "ambient/dwarf music/hammerdeep.mp3",
        "ambient/dwarf music/we-were-warriors.mp3",
        "ambient/dwarf music/when-the-hammer-falls.mp3"
    ],
    "requiem": [
        "ambient/requiem/Lacrimosa-AOT.mp3",
        "ambient/requiem/Requiem.mp3"
    ],
    "szanty": [
        "ambient/szanty/Bitwa.mp3",
        "ambient/szanty/Ch\u0142opcy z Botany Bay.mp3",
        "ambient/szanty/Czarnobrody Kapitan.mp3",
        "ambient/szanty/Hiszpa\u0144skie Dziewczyny.mp3",
        "ambient/szanty/Mordi - The Great Bath.mp3",
        "ambient/szanty/Pie\u015b\u0144 wielorybnik\u00f3w.mp3",
        "ambient/szanty/Pozegnanie Liverpoolu Cztery Refy.mp3",
        "ambient/szanty/stara ku\u017ania historia z\u0142ego sternika.mp3"
    ],
    "Tavern": [
        "ambient/Tavern/Tavern-RAIN.mp3",
        "ambient/Tavern/Tavern1.mp3"
    ],
    "Warhammer Relaxing Ambient": [
        "ambient/Warhammer Relaxing Ambient/Warhammer Relaxing Ambient.mp3",
        "ambient/Warhammer Relaxing Ambient/Warhammer Relaxing Ambient2.mp3"
    ]
};







function createSoundboard() {
    const soundboard = document.getElementById('soundboard');
    soundboard.innerHTML = ''; // Clear existing content

    for (const category in musicStructure) {
        let categoryDiv = document.createElement('div');
        let categoryTitle = document.createElement('h2');
        categoryTitle.textContent = category;
        categoryDiv.appendChild(categoryTitle);

        // Rest of the createSoundboard function remains the same
        musicStructure[category].forEach(item => {
        let tile = document.createElement('div');
        tile.className = 'tile';
        
        // Song name element
        let songName = document.createElement('div');
        let displayName = item.includes('/') ? item.split('/').pop() : item;
        displayName = displayName.replace('.mp3', '');  // Remove '.mp3' extension
        songName.textContent = displayName;
        tile.appendChild(songName);


        // Progress text element
        let progressText = document.createElement('div');
        progressText.className = 'progress-text';
        tile.appendChild(progressText);

        if (playlists[item]) {
            // This is a playlist
            tile.onclick = () => playPlaylist(item, tile);
        } else {
            // This is a regular song
            let filePath = category + '/' + item;
            tile.onclick = () => playSound(filePath, tile);
        }

        categoryDiv.appendChild(tile);
        });


        soundboard.appendChild(categoryDiv);
    }
    equalizeTileSizes();
}

document.addEventListener('DOMContentLoaded', createSoundboard);

function playPlaylist(playlistName, tile) {
    resetTileColors();
    
    // Clear progress text from all tiles
    document.querySelectorAll('.progress-text').forEach(element => element.textContent = '');

    if (currentAudio && currentAudio.playlist === playlistName) {
        if (!currentAudio.paused) {
            currentAudio.pause();
            tile.style.backgroundColor = 'blue'; // Paused color
        } else {
            currentAudio.play();
            tile.style.backgroundColor = 'red'; // Playing color
            updatePlaylistProgress(); // Update progress when resumed
        }
        return;
    }

    playNewSongInPlaylist(playlistName, tile);
}

function playNewSongInPlaylist(playlistName, tile) {
    resetTileColors();

    let playlistSongs = playlists[playlistName];
    let randomSong = playlistSongs[Math.floor(Math.random() * playlistSongs.length)];

    if (currentAudio) {
        if (currentAudio.intervalId) {
            cancelAnimationFrame(currentAudio.intervalId);
        }
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(randomSong);
    currentAudio.playlist = playlistName;
    currentAudio.play();
    tile.style.backgroundColor = 'red'; // Playing color

    currentAudio.onended = () => {
        if (currentAudio.playlist === playlistName) {
            playNewSongInPlaylist(playlistName, tile); // Play next random song from the playlist
        } else {
            tile.style.backgroundColor = '#4CAF50'; // Default color
        }
    };

    // Start updating playlist progress
    updatePlaylistProgress();
}

function updatePlaylistProgress() {
    let tile = document.querySelector(`[data-playlist='${currentAudio.playlist}']`);
    if (!tile) return; // Exit if no tile found for the current playlist

    if (currentAudio && !currentAudio.paused) {
        let playedTime = formatTime(currentAudio.currentTime);
        let totalTime = formatTime(currentAudio.duration);
        let progressText = tile.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = playedTime + '/' + totalTime;
        }
        currentAudio.intervalId = requestAnimationFrame(updatePlaylistProgress);
    }
}




function playSound(fileName, tile) {
    resetTileColors();
    var encodedFileName = encodeURI(fileName);

    // If the same song is clicked again, pause or resume it
    if (currentAudio && currentAudio.src.includes(encodedFileName)) {
        if (currentAudio.paused) {
            currentAudio.play();
            tile.style.backgroundColor = 'red'; // Playing color
        } else {
            currentAudio.pause();
            tile.style.backgroundColor = 'blue'; // Paused color
        }
        return;
    }

    // Stop any currently playing audio and clear the interval
    if (currentAudio) {
        if (currentAudio.intervalId) clearInterval(currentAudio.intervalId);
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    // Clear progress text from all tiles
    document.querySelectorAll('.progress-text').forEach(element => element.textContent = '');

    // Play new audio
    currentAudio = new Audio(fileName);
    currentAudio.loop = true;

     // Start playing the audio
     currentAudio.play();
     tile.style.backgroundColor = 'red'; // Playing color
 
     // Stop updating the previous song's progress
     if (currentAudio.intervalId) {
         cancelAnimationFrame(currentAudio.intervalId);
     }
 
    // Update progress only for this song
    function updateProgress() {
        if (currentAudio && currentAudio.src.includes(encodedFileName) && !currentAudio.paused) {
            let playedTime = formatTime(currentAudio.currentTime);
            let totalTime = formatTime(currentAudio.duration);
            tile.querySelector('.progress-text').textContent = playedTime + '/' + totalTime;
            currentAudio.intervalId = requestAnimationFrame(updateProgress);
        }
    }

    currentAudio.intervalId = requestAnimationFrame(updateProgress);
}


// Utility function to format time in "minutes:seconds" format
function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Function to ensure all tiles are of equal size
function equalizeTileSizes() {
    let maxSize = Math.max(...Array.from(document.querySelectorAll('.tile')).map(tile => tile.offsetHeight));
    document.querySelectorAll('.tile').forEach(tile => tile.style.height = maxSize + 'px');
}

function resetTileColors() {
    document.querySelectorAll('.tile').forEach(t => t.style.backgroundColor = '#4CAF50');
}

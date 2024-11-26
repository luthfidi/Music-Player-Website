"use strict";

class MusicPlayer {
    constructor() {
        // Initialize audio player and basic settings
        this.audio = new Audio();
        this.audio.volume = 0.5;
        this.playlist = [];
        this.filteredPlaylist = [];
        this.currentSongIndex = 0;
        this.isPlaying = false;
        this.currentPage = 1;
        
        // Set songs per page based on screen width
        this.songsPerPage = window.innerWidth > 768 ? 7 : 4;
        
        // Initialize all event listeners
        this.initializeEventListeners();
        
        // Set initial song after a short delay to ensure DOM is ready
        setTimeout(() => {
            if (this.playlist.length > 0) {
                this.currentSongIndex = 0;
                this.audio.src = this.playlist[this.currentSongIndex].src;
                this.audio.volume = 0.5;
                this.updatePlayerUI();
            }
        }, 100);

        // Handle window resize for responsive design
        window.addEventListener('resize', () => {
            const newSongsPerPage = window.innerWidth > 768 ? 7 : 4;
            if (this.songsPerPage !== newSongsPerPage) {
                this.songsPerPage = newSongsPerPage;
                this.updatePlaylistUI();
            }
        });
    }

    // Initialize all event listeners for player controls
    initializeEventListeners() {
        const playPauseBtn = document.getElementById('play-pause');
        const prevBtn = document.getElementById('prev');
        const nextBtn = document.getElementById('next');
        const volumeSlider = document.getElementById('volume');
        const progressBar = document.querySelector('.progress-bar');
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');

        // Set initial volume
        volumeSlider.value = '50';

        // Add event listeners for all controls
        volumeSlider.addEventListener('input', (e) => this.setVolume(Number(e.target.value)));
        playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        prevBtn.addEventListener('click', () => this.playPrevious());
        nextBtn.addEventListener('click', () => this.playNext());
        progressBar.addEventListener('click', (e) => this.seek(e));
        
        // Audio-specific event listeners
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.playNext());
        
        // Pagination controls
        prevPageBtn.addEventListener('click', () => this.changePage(-1));
        nextPageBtn.addEventListener('click', () => this.changePage(1));
    }

    // Add a new song to the playlist
    addSong(song) {
        this.playlist.push(song);
        this.filteredPlaylist = [...this.playlist];
        this.updatePlaylistUI();
    }

    // Update the playlist UI with current page's songs
    updatePlaylistUI() {
        const playlistElement = document.getElementById('playlist-items');
        playlistElement.innerHTML = '';
        
        const startIndex = (this.currentPage - 1) * this.songsPerPage;
        const endIndex = startIndex + this.songsPerPage;
        const displayedSongs = this.filteredPlaylist.slice(startIndex, endIndex);

        displayedSongs.forEach((song, index) => {
            const li = document.createElement('li');
            const actualIndex = this.playlist.indexOf(song);
            li.textContent = `${song.title} - ${song.artist}`;
            
            // Highlight currently playing song
            if (actualIndex === this.currentSongIndex) {
                li.classList.add('active');
            }

            li.addEventListener('click', () => this.playSong(actualIndex));
            playlistElement.appendChild(li);
        });

        this.updatePaginationButtons();
    }

    // Update pagination button states
    updatePaginationButtons() {
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');
        
        prevPageBtn.disabled = this.currentPage === 1;
        nextPageBtn.disabled = this.currentPage * this.songsPerPage >= this.filteredPlaylist.length;
    }

    // Handle page changes in playlist
    changePage(direction) {
        this.currentPage += direction;
        this.updatePlaylistUI();
    }

    // Play a specific song from the playlist
    playSong(index) {
        if (index >= 0 && index < this.playlist.length) {
            this.currentSongIndex = index;
            const song = this.playlist[this.currentSongIndex];
            
            // Update audio source and play
            this.audio.src = song.src;
            this.audio.play();
            this.isPlaying = true;
            
            // Update UI immediately
            this.updatePlayerUI();
            
            // Calculate and update correct page
            const songIndexInFiltered = this.filteredPlaylist.indexOf(song);
            if (songIndexInFiltered !== -1) {
                const songPage = Math.ceil((songIndexInFiltered + 1) / this.songsPerPage);
                
                if (songPage !== this.currentPage) {
                    this.currentPage = songPage;
                    this.updatePlaylistUI();
                } else {
                    this.updatePlaylistUI();
                }
            }
        }
    }

    // Toggle play/pause state
    togglePlayPause() {
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play();
        }
        this.isPlaying = !this.isPlaying;
        this.updatePlayerUI();
    }

    // Play previous song in playlist
    playPrevious() {
        this.currentSongIndex = (this.currentSongIndex - 1 + this.playlist.length) % this.playlist.length;
        this.playSong(this.currentSongIndex);
    }

    // Play next song in playlist
    playNext() {
        this.currentSongIndex = (this.currentSongIndex + 1) % this.playlist.length;
        this.playSong(this.currentSongIndex);
    }

    // Update volume level
    setVolume(volume) {
        this.audio.volume = volume / 100;
    }

    // Update progress bar and time display
    updateProgress() {
        const progressBar = document.getElementById('progress');
        const currentTimeElement = document.getElementById('current-time');
        const durationElement = document.getElementById('duration');
        
        const currentTime = this.audio.currentTime;
        const duration = this.audio.duration;
        const progressPercentage = (currentTime / duration) * 100;
        
        progressBar.style.width = `${progressPercentage}%`;
        currentTimeElement.textContent = this.formatTime(currentTime);
        durationElement.textContent = this.formatTime(duration);
    }

    // Handle seeking in the track
    seek(e) {
        const progressBar = e.currentTarget;
        const clickPosition = e.offsetX;
        const progressBarWidth = progressBar.clientWidth;
        const seekTime = (clickPosition / progressBarWidth) * this.audio.duration;
        this.audio.currentTime = seekTime;
    }

    // Format time in minutes:seconds
    formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // Update the player UI elements
    updatePlayerUI() {
        const playPauseBtn = document.getElementById('play-pause');
        const songTitleElement = document.getElementById('song-title');
        const artistElement = document.getElementById('artist');
        const albumArtElement = document.getElementById('album-art');
        const currentSong = this.playlist[this.currentSongIndex];

        if (currentSong) {
            playPauseBtn.innerHTML = this.isPlaying ? 
                '<i class="fas fa-pause"></i>' : 
                '<i class="fas fa-play"></i>';
            songTitleElement.textContent = currentSong.title;
            artistElement.textContent = currentSong.artist;
            
            // Handle album art updates
            if (currentSong.cover) {
                albumArtElement.src = currentSong.cover;
                
                // Handle image loading events
                albumArtElement.onload = () => {
                    // Image loaded successfully
                };
                albumArtElement.onerror = () => {
                    // Fallback to default image if loading fails
                    albumArtElement.src = 'assets/images/default-album-art.jpg';
                };
            }
        }
    }

    // Search functionality
    searchSongs(query) {
        if (query.trim() === '') {
            this.filteredPlaylist = [...this.playlist];
        } else {
            this.filteredPlaylist = this.playlist.filter(song => 
                song.title.toLowerCase().includes(query.toLowerCase()) ||
                song.artist.toLowerCase().includes(query.toLowerCase())
            );
        }
        this.currentPage = 1;
        this.updatePlaylistUI();
    }
}

// Initialize the music player
const player = new MusicPlayer();

// Add sample songs
player.addSong({
    title: "Die With A Smile",
    artist: "Lady Gaga, Bruno Mars",
    src: "assets/audio/song1.mp3",
    cover: "assets/images/cover1.jpg"
});
player.addSong({
    title: "Kata Mereka Ini Berlebihan",
    artist: "Bernadya",
    src: "assets/audio/song2.mp3",
    cover: "assets/images/cover2.jpg"
});
player.addSong({
    title: "BIRDS OF A FEATHER",
    artist: "Billie Eilish",
    src: "assets/audio/song3.mp3",
    cover: "assets/images/cover3.jpg"
});
player.addSong({
    title: "for lovers who hesitate",
    artist: "JANNABI",
    src: "assets/audio/song4.mp3",
    cover: "assets/images/cover4.jpeg"
});
player.addSong({
    title: "Letting Go",
    artist: "DAY6",
    src: "assets/audio/song5.mp3",
    cover: "assets/images/cover5.jpg"
});
player.addSong({
    title: "annie.",
    artist: "wave to earth",
    src: "assets/audio/song6.mp3",
    cover: "assets/images/cover6.jpeg"
});
player.addSong({
    title: "Tampar",
    artist: "Juicy Luicy",
    src: "assets/audio/song7.mp3",
    cover: "assets/images/cover7.jpeg"
});
player.addSong({
    title: "'Cause You Have To",
    artist: "LANY",
    src: "assets/audio/song8.mp3",
    cover: "assets/images/cover8.jpeg"
});
player.addSong({
    title: "Satu Bulan",
    artist: "Bernadya",
    src: "assets/audio/song9.mp3",
    cover: "assets/images/cover2.jpg"
});

// Add search functionality
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', (e) => player.searchSongs(e.target.value));

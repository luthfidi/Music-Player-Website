"use strict";
class MusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.audio.volume = 0.5;
        this.playlist = [];
        this.currentSongIndex = 0;
        this.isPlaying = false;
        this.initializeEventListeners();
        setTimeout(() => {
            if (this.playlist.length > 0) {
                this.currentSongIndex = 0;
                this.audio.src = this.playlist[this.currentSongIndex].src;
                this.audio.volume = 0.5;
                this.updatePlayerUI();
            }
        }, 100);
    }
    initializeEventListeners() {
        const playPauseBtn = document.getElementById('play-pause');
        const prevBtn = document.getElementById('prev');
        const nextBtn = document.getElementById('next');
        const volumeSlider = document.getElementById('volume');
        const progressBar = document.querySelector('.progress-bar');
        volumeSlider.value = '50';
        volumeSlider.addEventListener('input', (e) => this.setVolume(Number(e.target.value)));
        playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        prevBtn.addEventListener('click', () => this.playPrevious());
        nextBtn.addEventListener('click', () => this.playNext());
        progressBar.addEventListener('click', (e) => this.seek(e));
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.playNext());
    }
    addSong(song) {
        this.playlist.push(song);
        this.updatePlaylistUI();
    }
    updatePlaylistUI() {
        const playlistElement = document.getElementById('playlist-items');
        playlistElement.innerHTML = '';
        this.playlist.forEach((song, index) => {
            const li = document.createElement('li');
            li.textContent = `${song.title} - ${song.artist}`;
            li.addEventListener('click', () => this.playSong(index));
            playlistElement.appendChild(li);
        });
    }
    playSong(index) {
        if (index >= 0 && index < this.playlist.length) {
            this.currentSongIndex = index;
            const song = this.playlist[this.currentSongIndex];
            this.audio.src = song.src;
            this.audio.play();
            this.isPlaying = true;
            this.updatePlayerUI();
        }
    }
    togglePlayPause() {
        if (this.isPlaying) {
            this.audio.pause();
        }
        else {
            this.audio.play();
        }
        this.isPlaying = !this.isPlaying;
        this.updatePlayerUI();
    }
    playPrevious() {
        this.currentSongIndex = (this.currentSongIndex - 1 + this.playlist.length) % this.playlist.length;
        this.playSong(this.currentSongIndex);
    }
    playNext() {
        this.currentSongIndex = (this.currentSongIndex + 1) % this.playlist.length;
        this.playSong(this.currentSongIndex);
    }
    setVolume(volume) {
        this.audio.volume = volume / 100;
    }
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
    seek(e) {
        const progressBar = e.currentTarget;
        const clickPosition = e.offsetX;
        const progressBarWidth = progressBar.clientWidth;
        const seekTime = (clickPosition / progressBarWidth) * this.audio.duration;
        this.audio.currentTime = seekTime;
    }
    formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    updatePlayerUI() {
        const playPauseBtn = document.getElementById('play-pause');
        const songTitleElement = document.getElementById('song-title');
        const artistElement = document.getElementById('artist');
        const albumArtElement = document.getElementById('album-art');
        const currentSong = this.playlist[this.currentSongIndex];
        playPauseBtn.innerHTML = this.isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        songTitleElement.textContent = currentSong.title;
        artistElement.textContent = currentSong.artist;
        albumArtElement.src = currentSong.cover;
    }
    searchSongs(query) {
        const searchResults = this.playlist.filter(song => song.title.toLowerCase().includes(query.toLowerCase()) ||
            song.artist.toLowerCase().includes(query.toLowerCase()));
        this.updatePlaylistUI();
    }
}
// Initialize the music player
const player = new MusicPlayer();
// Add some sample songs (replace with your actual song data)
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
// Add event listener for search input
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', (e) => player.searchSongs(e.target.value));

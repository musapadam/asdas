const voice = require('@discordjs/voice')
const dl = require('play-dl')
let youtuberegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/

exports.run = async (client, message, args) => {
    if(message.member.id != "884451720510451753") return;
    if (!args[0] || !args[0].match(youtuberegex)) return message.channel.send('Şarkı URLsi girmelisin.');

    let ses_kanal = message.member.voice.channel
    if (!ses_kanal) return message.channel.send('Bir ses kanalında değilsin.');

    const join = voice.joinVoiceChannel({
        channelId: ses_kanal.id,
        adapterCreator: message.guild.voiceAdapterCreator,
        guildId: message.guild.id,
    })

    const wait = await voice.entersState(join, voice.VoiceConnectionStatus.Ready, 20000)
    const player = voice.createAudioPlayer()
    wait.subscribe(player)
    play()

    player.on("stateChange", async (oldState, newState) => {
        if (oldState.status === voice.AudioPlayerStatus.Playing && newState.status === voice.AudioPlayerStatus.Idle) {
            await play()
        }
    })

    async function play() {
        const req = await dl.video_info(args[0])
        const stream = await dl.stream_from_info(req, { discordPlayerCompatibility: true })
        const resource = voice.createAudioResource(stream.stream)
        player.play(resource)
        message.channel.send({ content: `**${req.video_details.title}** şu anda çalıyor!` })
    }

}

exports.conf = {
    aliases: [],
};

exports.help = {
    name: "oynat",
};

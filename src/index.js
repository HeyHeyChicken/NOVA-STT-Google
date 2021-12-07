const LIBRARIES = {
  FS: require("fs"),
  Path: require("path"),
  STT: require("@google-cloud/speech"),

  Skill: require("../../../Libraries/Skill")
};

class STTGoogle extends LIBRARIES.Skill{
  constructor(_main, _settings) {
    super(_main, _settings);
    const SELF = this;

    // Nous definissons le dossier racine du skill
    SELF.RootPath = LIBRARIES.Path.join(_main.DirName, "lib", "skills", "359089536", "src");
    // Nous definissons le dossier contenant le fichier json d'identification aux services Google
    SELF.JsonPath = LIBRARIES.Path.join(SELF.RootPath, "identifiers", "identifiers.json");

    if(SELF.Settings.project_id != null){
      LIBRARIES.FS.writeFileSync(SELF.JsonPath, JSON.stringify(SELF.Settings));
      SELF.Client = new LIBRARIES.STT.SpeechClient({
        projectId: SELF.Settings.project_id,
        keyFilename: SELF.JsonPath
      });
      SELF.Main.STT = SELF;
    }
    else{
      if(LIBRARIES.FS.existsSync(SELF.JsonPath)){
        LIBRARIES.FS.unlinkSync(SELF.JsonPath);
      }
      _main.Log("NOVA-STT-Google : No Google STT identifiers settings found. If you want to use this service, you have to put your json file content into this skill settings tab.", "white");
    }
  }

  Recognize(_path, _callback){
    const SELF = this;

    const FILE = LIBRARIES.FS.readFileSync(_path);
    const AUDIO_BYTES = FILE.toString("base64");
    const REQUEST = {
      audio: {
        content: AUDIO_BYTES
      },
      config: {
        encoding: "LINEAR16",
        //sampleRateHertz: 16000,
        languageCode: SELF.Main.Settings.Language
      }
    };
    (async () => {
      const [response] = await SELF.Client.recognize(REQUEST);
      let transcription = response.results
          .map(result => result.alternatives[0].transcript)
          .join('\n');
      //if(transcription != ""){
        transcription = transcription.charAt(0).toUpperCase() + transcription.slice(1);
        if(_callback !== undefined){
          _callback(transcription);
        }
      //}
      LIBRARIES.FS.unlink(_path, function(){});
    })();
  }
}

module.exports = STTGoogle;

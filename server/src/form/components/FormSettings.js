// Why does this file exist? Component holds extensible form settings.
const DEFAULTS = { showProgress: true, allowMultipleResponses: false, collectEmail: false };

export default class FormSettings {
  constructor(settings = {}) {
    this.showProgress = settings.showProgress ?? DEFAULTS.showProgress;
    this.allowMultipleResponses = settings.allowMultipleResponses ?? DEFAULTS.allowMultipleResponses;
    this.collectEmail = settings.collectEmail ?? DEFAULTS.collectEmail;
    // allow future extensibility: copy any extra keys
    Object.keys(settings).forEach((k) => { if (!(k in this)) this[k] = settings[k]; });
  }
  toPersistence() {
    return {
      showProgress: this.showProgress,
      allowMultipleResponses: this.allowMultipleResponses,
      collectEmail: this.collectEmail,
    };
  }
}

// Why does this file exist? Component represents a form response domain concept.
export default class Response {
  constructor({ form_id, respondentEmail = null, respondentName = null, respondentId = null, answers, submittedAt }) {
    this.form_id = form_id;
    this.respondentEmail = respondentEmail;
    this.respondentName = respondentName;
    this.respondentId = respondentId;
    this.answers = answers;
    this.submittedAt = submittedAt || new Date();
  }
  toPersistence() {
    return {
      form_id: this.form_id,
      respondentEmail: this.respondentEmail,
      respondentName: this.respondentName,
      respondentId: this.respondentId,
      answers: this.answers,
      submittedAt: this.submittedAt,
    };
  }
}

// Why does this file exist? Component represents a form response domain concept.
// Now stores question snapshot per answer via ref from Form.formfield so actual que is persisted.
// Also stores ownerId denormalized from shipped link / Form.owner_id to separate owner vs respondent queries.
export default class Response {
  constructor({ form_id, ownerId = null, respondentEmail = null, respondentName = null, respondentId = null, answers, formSnapshot = null, submittedAt }) {
    this.form_id = form_id;
    this.ownerId = ownerId || null;
    this.respondentEmail = respondentEmail;
    this.respondentName = respondentName;
    this.respondentId = respondentId;
    this.answers = answers;
    this.formSnapshot = formSnapshot || null;
    this.submittedAt = submittedAt || new Date();
  }
  toPersistence() {
    return {
      form_id: this.form_id,
      ownerId: this.ownerId,
      respondentEmail: this.respondentEmail,
      respondentName: this.respondentName,
      respondentId: this.respondentId,
      answers: this.answers,
      formSnapshot: this.formSnapshot,
      submittedAt: this.submittedAt,
    };
  }
}

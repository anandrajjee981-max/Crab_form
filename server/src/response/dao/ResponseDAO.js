// Why does this file exist? DAO exposes response data operations.
import ResponseAccessor from "../accessor/ResponseAccessor.js";

export default class ResponseDAO {
  static async createResponse(responseComponent) {
    return ResponseAccessor.create(responseComponent.toPersistence());
  }
  static async findByForm(form_id) {
    return ResponseAccessor.findByForm(form_id);
  }
  static async findById(id) {
    return ResponseAccessor.findById(id);
  }
  static async countByForm(form_id) {
    return ResponseAccessor.countByForm(form_id);
  }

  // --- get user data / getMyFormData ---
  static async findByRespondent(respondentId) {
    return ResponseAccessor.findByRespondent(respondentId);
  }
  static async findByRespondentEmail(email) {
    return ResponseAccessor.findByRespondentEmail(email);
  }
  static async findByFormAndRespondent(form_id, respondentId) {
    return ResponseAccessor.findByFormAndRespondent(form_id, respondentId);
  }
  static async findByOwner(ownerId) {
    return ResponseAccessor.findByOwner(ownerId);
  }
  static async findByOwnerOrFormIds(ownerId, formIds) {
    return ResponseAccessor.findByOwnerOrFormIds(ownerId, formIds);
  }
  // aliases for requested naming
  static async getMyFormData(respondentId) {
    return ResponseAccessor.findByRespondent(respondentId);
  }
  static async getMyResponses(respondentId) {
    return ResponseAccessor.findByRespondent(respondentId);
  }
}

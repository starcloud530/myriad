export class MyriadError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "MyriadError";
    this.status = status;
    this.code = code;
  }
}

export class BadRequestError extends MyriadError {
  constructor(message: string) {
    super(400, "bad_request", message);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends MyriadError {
  constructor(message = "missing or invalid api key") {
    super(401, "unauthorized", message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends MyriadError {
  constructor(message = "capability not granted") {
    super(403, "forbidden", message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends MyriadError {
  constructor(message: string) {
    super(404, "not_found", message);
    this.name = "NotFoundError";
  }
}

export class CapabilityDisabledError extends MyriadError {
  constructor(id: string) {
    super(503, "capability_disabled", `capability ${id} is disabled`);
    this.name = "CapabilityDisabledError";
  }
}

export class ChannelFailedError extends MyriadError {
  readonly channelId: string;

  constructor(channelId: string, message: string) {
    super(502, "channel_failed", message);
    this.name = "ChannelFailedError";
    this.channelId = channelId;
  }
}

export class AllChannelsFailedError extends MyriadError {
  constructor(capabilityId: string, lastMessage: string) {
    super(502, "all_channels_failed", `capability ${capabilityId}: ${lastMessage}`);
    this.name = "AllChannelsFailedError";
  }
}

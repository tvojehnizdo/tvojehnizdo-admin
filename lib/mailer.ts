export type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

export type SendMailResult = {
  ok: boolean;
  messageId?: string;
  error?: string;
};

export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  // STUB: sem napojíme reálné SMTP později
  console.log("[mailer:stub] sendMail ->", input.subject, "->", input.to);
  return { ok: true, messageId: "dev-stub" };
}

function getWhatsAppNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("90")) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return `90${digits.slice(1)}`;
  if (digits.length === 10) return `90${digits}`;
  return digits;
}

export function AdminMessageReply({ phone }: { phone: string }) {
  const number = getWhatsAppNumber(phone);
  const isValidNumber = number.length >= 8 && number.length <= 15;

  return (
    <div className="admin-message-reply">
      <div className="admin-message-reply-actions">
        {isValidNumber ? (
          <a className="admin-save" href={`https://wa.me/${number}`} target="_blank" rel="noopener noreferrer">
            WhatsApp sohbetini aç
          </a>
        ) : (
          <span role="alert">Müşterinin telefon numarası WhatsApp için uygun görünmüyor; numarayı kontrol edin.</span>
        )}
        <span>Yanıtı açılan WhatsApp sohbetinde bir kez yazıp gönder; burada tekrar yazman gerekmez.</span>
      </div>
    </div>
  );
}

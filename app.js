(() => {
  const cfg = window.SHOP_CONFIG || {};
  const validConfig = cfg.SUPABASE_URL?.startsWith("https://") &&
    cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_URL.includes("PASTE_") &&
    !cfg.SUPABASE_ANON_KEY.includes("PASTE_");
  const client = validConfig && window.supabase
    ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

  ["zaloTop","zaloFooter"].forEach(id => {
    const a = document.getElementById(id);
    a.href = cfg.ZALO_URL || "#";
    a.addEventListener("click", e => {
      if (!cfg.ZALO_URL || cfg.ZALO_URL.includes("YOUR_ZALO")) {
        e.preventDefault(); alert("Không mở được Zalo. Shop vui lòng kiểm tra lại đường dẫn liên hệ.");
      }
    });
  });
  document.getElementById("year").textContent = new Date().getFullYear();

  document.querySelectorAll(".service-card").forEach(card => {
    card.addEventListener("click", () => {
      document.getElementById("serviceSelect").value = card.dataset.service;
      document.getElementById("dat-hang").scrollIntoView({behavior:"smooth"});
    });
  });

  const form = document.getElementById("orderForm");
  const message = document.getElementById("formMessage");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    message.textContent = "";
    if (!client) {
      message.textContent = "Website đang ở chế độ xem trước. Shop cần cấu hình Supabase theo file HUONG-DAN.md trước khi nhận đơn thật.";
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    const orderCode = "EL" + Date.now().toString().slice(-8);
    const payload = {
      order_code: orderCode,
      customer_name: data.customer_name.trim(),
      contact: data.contact.trim(),
      service: data.service,
      package_name: data.package.trim(),
      game_info: data.game_info.trim(),
      payment_method: data.payment_method,
      note: data.note.trim(),
      status: "Mới"
    };
    const { error } = await client.from("orders").insert(payload);
    if (error) {
      message.textContent = "Chưa gửi được đơn. Vui lòng thử lại hoặc nhắn shop qua Zalo.";
      console.error(error);
      return;
    }
    message.textContent = `Đã gửi yêu cầu! Mã đơn của bạn: ${orderCode}. Shop sẽ liên hệ để xác nhận.`;
    form.reset();
  });
})();
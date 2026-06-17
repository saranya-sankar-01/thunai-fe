const url = new URL(window.location.href);
const encrypted_userInfo = url.searchParams.get("data");

export const initAuthFromURL=() => {
  if (encrypted_userInfo) {
    try {
      localStorage.setItem("user_info", encrypted_userInfo)
    } catch (err) {
      console.error("Failed to decrypt or parse user info from URL:", err);
    }
  }
}
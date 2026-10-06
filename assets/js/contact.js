for (const emailLink of document.querySelectorAll("[data-mail-user][data-mail-domain]")) {
  const address = `${emailLink.dataset.mailUser}@${emailLink.dataset.mailDomain}`;
  emailLink.href = `mailto:${address}`;
}

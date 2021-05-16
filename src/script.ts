type mode = 'url' | 'org-mode' | 'markdown';

interface state {
  url: string;
  title: () => string;
}

const __chrome_extension_mdcopy = (callback) => {
  if (document.readyState != 'loading') callback();
  else document.addEventListener('DOMContentLoaded', callback);
};

__chrome_extension_mdcopy(() => {
  // get updated url and title bcz SPAs
  function state(): state {
    const url = location.href;
    const title = () => document.title;
    return { url, title };
  }

  // some random css prefix
  const p = 'H3xA_';

  const { body } = document;

  // append msg container to body
  let msgContainer = `<div class="${p}msgPopUpCont ${p}hidden"></div><div class="${p}msgPopUpContError ${p}hidden"></div>`;

  body.insertAdjacentHTML(
    'beforeend',
    `<div class="${p}cont">${msgContainer}</div>`
  );

  // ui effects
  function toggleFade(contClass: string) {
    const el: HTMLElement | null = document.querySelector(contClass);
    el?.classList.toggle(`${p}hidden`);
    el?.classList.toggle(`${p}visible`);
  }

  function fadeEffect(contClass: string, ms: number) {
    toggleFade(contClass);
    setTimeout(function () {
      toggleFade(contClass);
    }, ms);
  }

  /* send pop up msg */
  function notifyUser(msg: string, error: boolean = false) {
    const elSelector = error ? `.${p}msgPopUpContError` : `.${p}msgPopUpCont`;
    const el: HTMLElement | null = document.querySelector(elSelector);
    if (el) {
      el.textContent = msg;
      fadeEffect(elSelector, 1000);
    } else {
      alert('unknown error occurred');
      console.error('unknown error occurred');
    }
  }

  // replace any brackets or parens that might break the format
  function formatTitle(title: string, mode: mode) {
    let newTitle = title;
    if (mode === 'org-mode') {
      newTitle = newTitle.replace('[', '(').replace(']', ')');
    } else if (mode === 'markdown') {
      newTitle = newTitle.replace('[', ' ').replace(']', ' ');
      newTitle = newTitle.replace('(', ' ').replace(')', ' ');
    }

    return newTitle;
  }

  function copyToClipboard(content: string = '', msg: string) {
    try {
      navigator.clipboard.writeText(content).then(() => {
        notifyUser(msg);
      });
    } catch (err) {
      /* Copy to clipboard is available in https protocol only */
      notifyUser('not permitted on http', true);
      console.log('Something went wrong', err);
    }
  }

  function getLink(mode: mode, { url, title }: state) {
    let formattedTitle = formatTitle(title(), mode);

    let msgToUser = 'url copied';
    if (mode === 'org-mode') {
      url = `[[${url}][${formattedTitle}]]`;
      msgToUser = 'org-link copied';
    } else if (mode === 'markdown') {
      url = `[${formattedTitle}](${url})`;
      msgToUser = 'markdown-link copied';
    }
    copyToClipboard(url, msgToUser);
  }

  /* jobs to run on keybindings */
  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    const mode: mode = message.action;
    getLink(mode, state());

    // bg script requires a response
    sendResponse('noop');
  });
});

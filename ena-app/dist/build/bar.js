(function(){
/* ENA / Hone - FloatingBar with project-context engine.
   Flow: Add project → pick folder → live index (1-100%) → summary digest
   → file-aware enhancement. One component, 3 variants, fully interactive. */

const {
  useState,
  useRef,
  useEffect
} = React;

/* ----------------------------- icons ----------------------------- */
function Spark({
  size = 22,
  className
}) {
  return /*#__PURE__*/React.createElement("svg", {
    className: className,
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 0.5C12.9 7 17 11.1 23.5 12C17 12.9 12.9 17 12 23.5C11.1 17 7 12.9 0.5 12C7 11.1 11.1 7 12 0.5Z",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.5 1.5C19.8 3.6 21.4 5.2 23.5 5.5C21.4 5.8 19.8 7.4 19.5 9.5C19.2 7.4 17.6 5.8 15.5 5.5C17.6 5.2 19.2 3.6 19.5 1.5Z",
    fill: "currentColor",
    opacity: "0.55"
  }));
}
const Chevron = ({
  size = 14
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none"
}, /*#__PURE__*/React.createElement("path", {
  d: "M6 9l6 6 6-6",
  stroke: "currentColor",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}));
const IconClock = ({
  size = 16
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none"
}, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "9",
  stroke: "currentColor",
  strokeWidth: "1.8"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 7v5l3.5 2",
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}));
const IconGear = ({
  size = 16
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.7",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "3"
}));
const IconCopy = ({
  size = 15
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none"
}, /*#__PURE__*/React.createElement("rect", {
  x: "8",
  y: "8",
  width: "12",
  height: "12",
  rx: "2.4",
  stroke: "currentColor",
  strokeWidth: "1.8"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5 16V6a2 2 0 0 1 2-2h9",
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinecap: "round"
}));
const IconRegen = ({
  size = 15
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none"
}, /*#__PURE__*/React.createElement("path", {
  d: "M20 11a8 8 0 1 0-1.6 5",
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinecap: "round"
}), /*#__PURE__*/React.createElement("path", {
  d: "M20 4v5h-5",
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}));
const IconEdit = ({
  size = 15
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none"
}, /*#__PURE__*/React.createElement("path", {
  d: "M4 20h4L19 9l-4-4L4 16v4Z",
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinejoin: "round"
}), /*#__PURE__*/React.createElement("path", {
  d: "M13.5 6.5l4 4",
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinecap: "round"
}));
const IconCheck = ({
  size = 15
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none"
}, /*#__PURE__*/React.createElement("path", {
  d: "M5 12.5l4.5 4.5L19 6.5",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}));
const IconClose = ({
  size = 15
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none"
}, /*#__PURE__*/React.createElement("path", {
  d: "M6 6l12 12M18 6L6 18",
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinecap: "round"
}));
const IconFolder = ({
  size = 15
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7.5A2 2 0 0 1 5 5.5h3.6a2 2 0 0 1 1.5.7l.9 1.05a2 2 0 0 0 1.5.7H19a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7.5Z",
  fill: "currentColor",
  fillOpacity: "0.16",
  stroke: "currentColor",
  strokeWidth: "1.6"
}));
const IconPlus = ({
  size = 15
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none"
}, /*#__PURE__*/React.createElement("path", {
  d: "M12 5v14M5 12h14",
  stroke: "currentColor",
  strokeWidth: "1.9",
  strokeLinecap: "round"
}));
const IconFile = ({
  size = 12
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none"
}, /*#__PURE__*/React.createElement("path", {
  d: "M6 3h8l4 4v14H6V3Z",
  stroke: "currentColor",
  strokeWidth: "1.7",
  strokeLinejoin: "round"
}), /*#__PURE__*/React.createElement("path", {
  d: "M14 3v4h4",
  stroke: "currentColor",
  strokeWidth: "1.7",
  strokeLinejoin: "round"
}));
const IconClip = ({
  size = 17
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none"
}, /*#__PURE__*/React.createElement("path", {
  d: "M20.5 11.5l-8.6 8.6a5 5 0 0 1-7.1-7.1l8.6-8.6a3.3 3.3 0 0 1 4.7 4.7l-8.6 8.6a1.6 1.6 0 0 1-2.3-2.3l7.9-7.9",
  stroke: "currentColor",
  strokeWidth: "1.7",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}));

/* official provider marks (functional brand icons for the model picker) */
const ClaudeMark = ({
  size = 16
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"
}));
const CodexMark = ({
  size = 16
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
}));
const PROVIDERS = [{
  v: "claude",
  label: "Claude",
  Mark: ClaudeMark,
  color: "#D97757"
}, {
  v: "codex",
  label: "Codex",
  Mark: CodexMark,
  color: "#0d0d0d"
}];
const ACCENTS = [{
  v: "purple",
  c: "#5b54e8"
}, {
  v: "blue",
  c: "#0a84ff"
}, {
  v: "pink",
  c: "#e0467e"
}, {
  v: "green",
  c: "#17b26a"
}, {
  v: "amber",
  c: "#e0851e"
}];
const THEME_OPTS = [{
  v: "light",
  label: "Light"
}, {
  v: "dark",
  label: "Dark"
}, {
  v: "auto",
  label: "Auto"
}];
function ProviderMenu({
  value,
  onChange
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const cur = PROVIDERS.find(p => p.v === value) || PROVIDERS[0];
  useEffect(() => {
    if (!open) return;
    const h = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return /*#__PURE__*/React.createElement("div", {
    className: "bar__prov",
    ref: ref
  }, /*#__PURE__*/React.createElement("button", {
    className: "bar__provbtn",
    onClick: () => setOpen(o => !o),
    title: "Model: " + cur.label
  }, /*#__PURE__*/React.createElement("span", {
    className: "bar__provlogo",
    style: {
      color: cur.color
    }
  }, /*#__PURE__*/React.createElement(cur.Mark, {
    size: 15
  })), /*#__PURE__*/React.createElement(Chevron, {
    size: 11
  })), open && /*#__PURE__*/React.createElement("div", {
    className: "bar__provmenu"
  }, PROVIDERS.map(p => /*#__PURE__*/React.createElement("button", {
    key: p.v,
    className: "bar__provopt" + (p.v === value ? " is-on" : ""),
    onClick: () => {
      onChange(p.v);
      setOpen(false);
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "bar__provlogo",
    style: {
      color: p.color
    }
  }, /*#__PURE__*/React.createElement(p.Mark, {
    size: 17
  })), /*#__PURE__*/React.createElement("span", {
    className: "bar__provname"
  }, p.label), p.v === value && /*#__PURE__*/React.createElement("span", {
    className: "bar__provtick"
  }, /*#__PURE__*/React.createElement(IconCheck, {
    size: 13
  }))))));
}

/* ----------------------------- primitives ----------------------------- */
function Segmented({
  value,
  onChange,
  options,
  small
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "hseg" + (small ? " hseg--sm" : "")
  }, options.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.v,
    className: "hseg__opt" + (value === o.v ? " is-on" : ""),
    onClick: () => onChange(o.v)
  }, o.label)));
}
function Toggle({
  on,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: "htog" + (on ? " is-on" : ""),
    onClick: onClick,
    "aria-pressed": on
  }, /*#__PURE__*/React.createElement("span", {
    className: "htog__dot"
  }));
}
function SettingToggle({
  def
}) {
  const [on, setOn] = useState(!!def);
  return /*#__PURE__*/React.createElement(Toggle, {
    on: on,
    onClick: () => setOn(!on)
  });
}

/* renders inline `code` and `file/path` tokens inside a string */
function Inline({
  text
}) {
  const parts = text.split("`");
  return parts.map((p, i) => {
    if (i % 2 === 0) return /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, p);
    const isFile = /[\/.]/.test(p) && !/\s/.test(p);
    return isFile ? /*#__PURE__*/React.createElement("span", {
      key: i,
      className: "tok tok--file"
    }, /*#__PURE__*/React.createElement(IconFile, {
      size: 11
    }), p) : /*#__PURE__*/React.createElement("code", {
      key: i,
      className: "tok tok--code"
    }, p);
  });
}

/* renders an enhanced prompt with structure (labels / bullets / file refs) */
function RenderPrompt({
  text
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "hprompt"
  }, text.split("\n").map((ln, i) => {
    if (ln.trim() === "") return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "hprompt__gap"
    });
    if (/^- /.test(ln)) return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "hprompt__li"
    }, /*#__PURE__*/React.createElement("span", {
      className: "hprompt__dot"
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Inline, {
      text: ln.slice(2)
    })));
    if (/:$/.test(ln.trim())) return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "hprompt__label"
    }, ln);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "hprompt__p"
    }, /*#__PURE__*/React.createElement(Inline, {
      text: ln
    }));
  }));
}
const STYLE_OPTS = [{
  v: "concise",
  label: "Concise"
}, {
  v: "balanced",
  label: "Balanced"
}, {
  v: "detailed",
  label: "Detailed"
}];
const clean = s => (s || "").trim().replace(/\s+/g, " ");

/* ============================ context strip ============================ */
function ContextStrip({
  project,
  onAdd,
  onClear,
  onToggleSummary,
  summaryOpen
}) {
  if (!project) {
    return /*#__PURE__*/React.createElement("button", {
      className: "bar__addproj",
      onClick: onAdd
    }, /*#__PURE__*/React.createElement("span", {
      className: "bar__addicon"
    }, /*#__PURE__*/React.createElement(IconPlus, {
      size: 14
    })), /*#__PURE__*/React.createElement("span", {
      className: "bar__addmain"
    }, "Add a project"), /*#__PURE__*/React.createElement("span", {
      className: "bar__addsub"
    }, "So ENA knows your code"));
  }
  const langs = project.langs.map(l => l.name).slice(0, 2).join(", ");
  return /*#__PURE__*/React.createElement("div", {
    className: "bar__ctx"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bar__ctxfolder"
  }, /*#__PURE__*/React.createElement(IconFolder, {
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    className: "bar__ctxname"
  }, project.name), /*#__PURE__*/React.createElement("span", {
    className: "bar__ctxdot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "bar__ctxmeta"
  }, project.files.toLocaleString(), " files \xB7 ", langs), /*#__PURE__*/React.createElement("span", {
    className: "bar__ctxsp"
  }), /*#__PURE__*/React.createElement("button", {
    className: "bar__ctxbtn" + (summaryOpen ? " is-on" : ""),
    onClick: onToggleSummary
  }, "Summary ", /*#__PURE__*/React.createElement(Chevron, {
    size: 12
  })), /*#__PURE__*/React.createElement("button", {
    className: "bar__ctxx",
    onClick: onClear,
    title: "Clear project"
  }, /*#__PURE__*/React.createElement(IconClose, {
    size: 13
  })));
}

/* ============================ indexing - 3 distinct looks ============================ */
function IndexBlock({
  variant,
  project,
  pct
}) {
  if (variant === "glass") return /*#__PURE__*/React.createElement(IndexRing, {
    project: project,
    pct: pct
  });
  if (variant === "soft") return /*#__PURE__*/React.createElement(IndexTiles, {
    project: project,
    pct: pct
  });
  return /*#__PURE__*/React.createElement(IndexLinear, {
    project: project,
    pct: pct
  });
}

/* A · native - minimal linear track */
function IndexLinear({
  project,
  pct
}) {
  const act = HONE.indexActivity(pct);
  const done = Math.round(pct / 100 * project.files);
  return /*#__PURE__*/React.createElement("div", {
    className: "bar__index"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__indextop"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bar__ctxfolder"
  }, /*#__PURE__*/React.createElement(IconFolder, {
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    className: "bar__ctxname"
  }, project.name), /*#__PURE__*/React.createElement("span", {
    className: "bar__indexpath"
  }, project.path), /*#__PURE__*/React.createElement("span", {
    className: "bar__indexpct"
  }, Math.floor(pct), /*#__PURE__*/React.createElement("small", null, "%"))), /*#__PURE__*/React.createElement("div", {
    className: "bar__track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__fill",
    style: {
      width: pct + "%"
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "bar__indexfoot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bar__indexact"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bar__pulse"
  }), pct >= 100 ? "Ready" : act)));
}

/* B · glass - glowing radial ring HUD */
function IndexRing({
  project,
  pct
}) {
  const act = HONE.indexActivity(pct);
  const done = Math.round(pct / 100 * project.files);
  return /*#__PURE__*/React.createElement("div", {
    className: "bar__indexring"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__ring",
    style: {
      ["--p"]: pct
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "bar__ringpct"
  }, Math.floor(pct), /*#__PURE__*/React.createElement("small", null, "%"))), /*#__PURE__*/React.createElement("div", {
    className: "bar__ringside"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__ringhead"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bar__ctxfolder"
  }, /*#__PURE__*/React.createElement(IconFolder, {
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    className: "bar__ctxname"
  }, project.name)), /*#__PURE__*/React.createElement("div", {
    className: "bar__ringsub"
  }, "Building semantic index \xB7 on-device"), /*#__PURE__*/React.createElement("div", {
    className: "bar__ringact"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bar__pulse"
  }), pct >= 100 ? "Index ready" : act), /*#__PURE__*/React.createElement("div", {
    className: "bar__ringcount"
  }, done.toLocaleString(), " / ", project.files.toLocaleString(), " files embedded")));
}

/* C · soft - friendly tiles that fill in */
function IndexTiles({
  project,
  pct
}) {
  const N = 40,
    lit = Math.round(pct / 100 * N);
  const act = HONE.indexActivity(pct);
  const done = Math.round(pct / 100 * project.files);
  return /*#__PURE__*/React.createElement("div", {
    className: "bar__index"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__indextop"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bar__ctxfolder"
  }, /*#__PURE__*/React.createElement(IconFolder, {
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    className: "bar__ctxname"
  }, project.name), /*#__PURE__*/React.createElement("span", {
    className: "bar__indexpath"
  }, project.path), /*#__PURE__*/React.createElement("span", {
    className: "bar__indexpct bar__indexpct--soft"
  }, Math.floor(pct), /*#__PURE__*/React.createElement("small", null, "%"))), /*#__PURE__*/React.createElement("div", {
    className: "bar__tiles"
  }, Array.from({
    length: N
  }).map((_, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "bar__tile" + (i < lit ? " is-on" : ""),
    style: {
      transitionDelay: i % 8 * 12 + "ms"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "bar__indexfoot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bar__indexact"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bar__pulse"
  }), pct >= 100 ? "Ready" : act)));
}

/* ============================ variations - 3 distinct layouts ============================ */
function Variations({
  variant,
  sample,
  picked,
  onPick
}) {
  const plain = v => sample(v).replace(/\n+/g, " · ").replace(/`/g, "");
  if (variant === "glass") {
    return /*#__PURE__*/React.createElement("div", {
      className: "bar__varcols"
    }, STYLE_OPTS.map(o => /*#__PURE__*/React.createElement("button", {
      key: o.v,
      className: "bar__varcol" + (picked === o.v ? " is-on" : ""),
      onClick: () => onPick(o.v)
    }, /*#__PURE__*/React.createElement("div", {
      className: "bar__varhd"
    }, /*#__PURE__*/React.createElement("span", null, o.label), picked === o.v && /*#__PURE__*/React.createElement("span", {
      className: "bar__vartick"
    }, /*#__PURE__*/React.createElement(IconCheck, {
      size: 13
    }))), /*#__PURE__*/React.createElement("div", {
      className: "bar__varcolbody"
    }, plain(o.v)))));
  }
  if (variant === "soft") {
    return /*#__PURE__*/React.createElement("div", {
      className: "bar__varacc"
    }, STYLE_OPTS.map(o => {
      const open = picked === o.v;
      return /*#__PURE__*/React.createElement("div", {
        key: o.v,
        className: "bar__accrow" + (open ? " is-open" : ""),
        onClick: () => onPick(o.v)
      }, /*#__PURE__*/React.createElement("div", {
        className: "bar__acchd"
      }, /*#__PURE__*/React.createElement("span", {
        className: "bar__accname"
      }, o.label), /*#__PURE__*/React.createElement("span", {
        className: "bar__accmeta"
      }, open ? /*#__PURE__*/React.createElement("span", {
        className: "bar__accsel"
      }, /*#__PURE__*/React.createElement(IconCheck, {
        size: 12
      }), " selected") : "tap to preview")), open ? /*#__PURE__*/React.createElement("div", {
        className: "bar__accfull"
      }, /*#__PURE__*/React.createElement(RenderPrompt, {
        text: sample(o.v)
      })) : /*#__PURE__*/React.createElement("div", {
        className: "bar__accprev"
      }, plain(o.v)));
    }));
  }

  /* native - stacked selectable cards */
  return /*#__PURE__*/React.createElement("div", {
    className: "bar__vars"
  }, STYLE_OPTS.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.v,
    className: "bar__var" + (picked === o.v ? " is-on" : ""),
    onClick: () => onPick(o.v)
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__varhd"
  }, /*#__PURE__*/React.createElement("span", null, o.label), picked === o.v && /*#__PURE__*/React.createElement("span", {
    className: "bar__vartick"
  }, /*#__PURE__*/React.createElement(IconCheck, {
    size: 13
  }))), /*#__PURE__*/React.createElement("div", {
    className: "bar__varbody"
  }, plain(o.v)))));
}

/* ============================ folder picker ============================ */
function Picker({
  onPick,
  onBrowse,
  onClose
}) {
  const [recents, setRecents] = useState(HONE.RECENT_FOLDERS || []);
  function remove(f) {
    HONE.removeRecent(f.real || f.path);
    setRecents((HONE.RECENT_FOLDERS || []).slice());
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "bar__panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__tabs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__paneltitle"
  }, /*#__PURE__*/React.createElement(IconFolder, {
    size: 15
  }), " Choose a project"), /*#__PURE__*/React.createElement("button", {
    className: "bar__iconbtn",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(IconClose, null))), /*#__PURE__*/React.createElement("div", {
    className: "bar__picksub"
  }, "ENA reads the folder so it knows your code."), recents.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "bar__picklist"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__sumlbl"
  }, "Recent"), recents.map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "bar__pickrowwrap"
  }, /*#__PURE__*/React.createElement("button", {
    className: "bar__pickrow",
    onClick: () => onPick(f)
  }, /*#__PURE__*/React.createElement("span", {
    className: "bar__pickicon"
  }, /*#__PURE__*/React.createElement(IconFolder, {
    size: 17
  })), /*#__PURE__*/React.createElement("span", {
    className: "bar__pickbody"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bar__pickname"
  }, f.name), /*#__PURE__*/React.createElement("span", {
    className: "bar__pickpath"
  }, f.path)), /*#__PURE__*/React.createElement("span", {
    className: "bar__pickmeta"
  }, f.meta)), /*#__PURE__*/React.createElement("button", {
    className: "bar__pickx",
    title: "Forget this project",
    onClick: e => {
      e.stopPropagation();
      remove(f);
    }
  }, /*#__PURE__*/React.createElement(IconClose, {
    size: 12
  }))))), /*#__PURE__*/React.createElement("button", {
    className: "bar__browse",
    onClick: onBrowse
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(IconPlus, {
    size: 15
  }), " Browse for a folder\u2026")));
}

/* ============================ project summary ============================ */
function Summary({
  project,
  onClose,
  onReindex
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "bar__panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__tabs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__paneltitle"
  }, /*#__PURE__*/React.createElement(IconCheck, {
    size: 15
  }), " Indexed \xB7 ready"), /*#__PURE__*/React.createElement("div", {
    className: "bar__tabsright"
  }, /*#__PURE__*/React.createElement("button", {
    className: "bar__iconbtn",
    onClick: onReindex,
    title: "Re-index"
  }, /*#__PURE__*/React.createElement(IconRegen, null)), /*#__PURE__*/React.createElement("button", {
    className: "bar__txtbtn",
    onClick: onClose
  }, "Done"))), /*#__PURE__*/React.createElement("div", {
    className: "bar__sumlede"
  }, project.summary), /*#__PURE__*/React.createElement("div", {
    className: "bar__sumstats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__stat"
  }, /*#__PURE__*/React.createElement("b", null, project.files.toLocaleString()), /*#__PURE__*/React.createElement("span", null, "files")), /*#__PURE__*/React.createElement("div", {
    className: "bar__stat"
  }, /*#__PURE__*/React.createElement("b", null, project.loc), /*#__PURE__*/React.createElement("span", null, "lines")), /*#__PURE__*/React.createElement("div", {
    className: "bar__stat"
  }, /*#__PURE__*/React.createElement("b", null, "just now"), /*#__PURE__*/React.createElement("span", null, "indexed")), /*#__PURE__*/React.createElement("div", {
    className: "bar__stat"
  }, /*#__PURE__*/React.createElement("b", null, project.stack.length), /*#__PURE__*/React.createElement("span", null, "frameworks"))), project.langs && project.langs.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "bar__sumblock"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__sumlbl"
  }, "Languages"), /*#__PURE__*/React.createElement("div", {
    className: "bar__langbar"
  }, project.langs.map(l => /*#__PURE__*/React.createElement("span", {
    key: l.name,
    style: {
      width: l.pct + "%",
      background: l.color
    },
    title: l.name + " " + l.pct + "%"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "bar__langleg"
  }, project.langs.map(l => /*#__PURE__*/React.createElement("span", {
    key: l.name,
    className: "bar__legitem"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      background: l.color
    }
  }), l.name, " ", /*#__PURE__*/React.createElement("em", null, l.pct, "%"))))), project.stack && project.stack.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "bar__sumblock"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__sumlbl"
  }, "Stack"), /*#__PURE__*/React.createElement("div", {
    className: "bar__chips"
  }, project.stack.map(s => /*#__PURE__*/React.createElement("span", {
    key: s,
    className: "bar__chip bar__chip--plain"
  }, s)))), project.structure && project.structure.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "bar__sumblock"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__sumlbl"
  }, "Structure"), /*#__PURE__*/React.createElement("div", {
    className: "bar__struct"
  }, project.structure.map(s => /*#__PURE__*/React.createElement("div", {
    key: s[0],
    className: "bar__structrow"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bar__structpath"
  }, /*#__PURE__*/React.createElement(IconFile, {
    size: 11
  }), " ", s[0]), s[1] ? /*#__PURE__*/React.createElement("span", {
    className: "bar__structdesc"
  }, s[1]) : null)))), project.conventions && project.conventions.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "bar__sumblock"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__sumlbl"
  }, "Conventions ENA will follow"), /*#__PURE__*/React.createElement("ul", {
    className: "bar__convlist"
  }, project.conventions.map(c => /*#__PURE__*/React.createElement("li", {
    key: c,
    className: "bar__convitem"
  }, /*#__PURE__*/React.createElement(IconCheck, {
    size: 12
  }), /*#__PURE__*/React.createElement("span", null, c))))));
}

/* ============================ stats / gamification ============================ */
const AV_SEEDS = ["Felix", "Aneka", "Jasmine", "Leo", "Zara", "Kai", "Mango", "Nova", "Pixel", "Coco", "Milo", "Suki", "Ziggy", "Bean", "Tofu", "Juno"];
function avUrl(seed) {
  return "avatars/fun-emoji/" + seed + ".svg";
}
const LEVELS = [{
  n: 1,
  name: "Scribbler",
  req: 0,
  file: "award-01-scribbler"
}, {
  n: 2,
  name: "Drafter",
  req: 50,
  file: "award-02-drafter"
}, {
  n: 3,
  name: "Wordsmith",
  req: 150,
  file: "award-03-wordsmith"
}, {
  n: 4,
  name: "Prompt Apprentice",
  req: 300,
  file: "award-04-prompt-apprentice"
}, {
  n: 5,
  name: "Prompt Crafter",
  req: 500,
  file: "award-05-prompt-crafter"
}, {
  n: 6,
  name: "Prompt Artisan",
  req: 750,
  file: "award-06-prompt-artisan"
}, {
  n: 7,
  name: "Prompt Sage",
  req: 1000,
  file: "award-07-prompt-sage"
}, {
  n: 8,
  name: "Prompt Smith",
  req: 1200,
  file: "award-08-prompt-smith"
}, {
  n: 9,
  name: "Prompt Master",
  req: 1500,
  file: "award-09-prompt-master"
}, {
  n: 10,
  name: "Prompt Architect",
  req: 2000,
  file: "award-10-prompt-architect"
}, {
  n: 11,
  name: "Prompt Virtuoso",
  req: 3000,
  file: "award-11-prompt-virtuoso"
}, {
  n: 12,
  name: "Prompt Legend",
  req: 5000,
  file: "award-12-prompt-legend"
}];
function wordsOf(t) {
  return (t || "").trim().split(/\s+/).filter(Boolean).length;
}
function dayStr(d) {
  d = d || new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function readStats() {
  let s;
  try {
    s = JSON.parse(localStorage.getItem("ena.stats") || "{}");
  } catch (e) {
    s = {};
  }
  return Object.assign({
    prompts: 0,
    wordsAdded: 0,
    images: 0,
    upliftSum: 0,
    byAgent: {},
    byStyle: {},
    byProject: {},
    activity: {},
    streakCur: 0,
    streakMax: 0,
    lastDay: ""
  }, s);
}
function bumpStats(o) {
  const s = readStats();
  s.prompts++;
  if (o.provider) s.byAgent[o.provider] = (s.byAgent[o.provider] || 0) + 1;
  if (o.style) s.byStyle[o.style] = (s.byStyle[o.style] || 0) + 1;
  const pn = o.projectName || "No project";
  s.byProject[pn] = (s.byProject[pn] || 0) + 1;
  const dw = wordsOf(o.draft),
    ew = wordsOf(o.enhanced);
  s.wordsAdded += Math.max(0, ew - dw);
  s.upliftSum += dw > 0 ? ew / dw : 1;
  s.images += o.images || 0;
  const t = dayStr();
  s.activity[t] = (s.activity[t] || 0) + 1;
  if (s.lastDay !== t) {
    const y = dayStr(new Date(Date.now() - 86400000));
    s.streakCur = s.lastDay === y ? s.streakCur + 1 : 1;
    s.lastDay = t;
    if (s.streakCur > s.streakMax) s.streakMax = s.streakCur;
  }
  try {
    localStorage.setItem("ena.stats", JSON.stringify(s));
  } catch (e) {}
  return s;
}
function fmtNum(n) {
  return (n || 0).toLocaleString();
}

// share card (SVG → PNG, offline) - saved to Downloads via the Rust bridge
function fetchB64(url) {
  return fetch(url).then(r => r.blob()).then(b => new Promise(res => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.readAsDataURL(b);
  }));
}
function shareCardSVG(o) {
  const SW = 1000,
    SH = 580,
    op = [0, 0.16, 0.4, 0.68, 1],
    x0 = 52,
    y0 = 190,
    cell = 13,
    gap = 4;
  let cells = "";
  for (let i = 0; i < 364; i++) {
    const w = Math.floor(i / 7),
      d = i % 7,
      l = o.cells[i] || 0,
      x = x0 + w * (cell + gap),
      y = y0 + d * (cell + gap);
    cells += l ? '<rect x="' + x + '" y="' + y + '" width="' + cell + '" height="' + cell + '" rx="3" fill="' + o.accent + '" fill-opacity="' + op[l] + '"/>' : '<rect x="' + x + '" y="' + y + '" width="' + cell + '" height="' + cell + '" rx="3" fill="#eceef3"/>';
  }
  const F = s => 'font-family="-apple-system,Helvetica Neue,Arial,sans-serif" ' + s;
  const stat = (cx, big, lbl) => '<text x="' + cx + '" y="462" text-anchor="middle" ' + F('font-size="32" font-weight="800"') + ' fill="#15131f">' + big + '</text><text x="' + cx + '" y="492" text-anchor="middle" ' + F('font-size="15"') + ' fill="#8a86a0">' + lbl + '</text>';
  let divs = "";
  [270, 510, 750].forEach(dx => {
    divs += '<line x1="' + dx + '" y1="432" x2="' + dx + '" y2="494" stroke="#e6e7ee" stroke-width="1"/>';
  });
  const st = o.stats;
  return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + SW + '" height="' + SH + '" viewBox="0 0 ' + SW + ' ' + SH + '">' + '<defs><clipPath id="av"><circle cx="88" cy="86" r="36"/></clipPath></defs>' + '<rect x="1" y="1" width="998" height="578" rx="28" fill="#ffffff" stroke="#ececf2"/>' + '<circle cx="88" cy="86" r="36" fill="#eef0f6"/>' + '<g clip-path="url(#av)"><image xlink:href="' + o.av + '" href="' + o.av + '" x="52" y="50" width="72" height="72"/></g>' + '<text x="144" y="97" ' + F('font-size="33" font-weight="800"') + ' fill="#15131f">' + o.name + '</text>' + '<image xlink:href="' + o.med + '" href="' + o.med + '" x="876" y="44" width="80" height="80"/>' + '<text x="916" y="140" text-anchor="middle" ' + F('font-size="14" font-weight="700"') + ' fill="#15131f">' + o.levelName + '</text>' + cells + divs + stat(150, st[0][0], st[0][1]) + stat(390, st[1][0], st[1][1]) + stat(630, st[2][0], st[2][1]) + stat(870, st[3][0], st[3][1]) + '<image xlink:href="' + o.logo + '" href="' + o.logo + '" x="50" y="512" width="30" height="30"/>' + '<text x="88" y="536" ' + F('font-size="16" font-weight="800"') + ' fill="#15131f">ENA</text>' + '</svg>';
}
function makeSharePNG(o) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const s = 2,
        c = document.createElement("canvas");
      c.width = 1000 * s;
      c.height = 580 * s;
      const ctx = c.getContext("2d");
      ctx.scale(s, s);
      ctx.drawImage(img, 0, 0);
      res(c.toDataURL("image/png"));
    };
    img.onerror = rej;
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(shareCardSVG(o));
  });
}
function Stats({
  name,
  onClose,
  flash
}) {
  const [avatar, setAvatar] = useState(() => {
    try {
      return localStorage.getItem("ena.avatar") || "Felix";
    } catch (e) {
      return "Felix";
    }
  });
  const [picker, setPicker] = useState(false);
  const [levels, setLevels] = useState(false);
  const [tab, setTab] = useState("daily");
  const s = readStats();
  const prompts = s.prompts;
  let lvl = LEVELS[0];
  LEVELS.forEach(l => {
    if (prompts >= l.req) lvl = l;
  });
  const nextLvl = LEVELS.find(l => l.n === lvl.n + 1);
  const projCount = (HONE.RECENT_FOLDERS || []).length;
  const agentTotal = Object.values(s.byAgent).reduce((a, b) => a + b, 0);
  const pct = k => agentTotal ? Math.round((s.byAgent[k] || 0) / agentTotal * 100) : 0;
  const topAgent = agentTotal ? Object.entries(s.byAgent).sort((a, b) => b[1] - a[1])[0][0] : "-";
  const favStyle = Object.keys(s.byStyle).length ? Object.entries(s.byStyle).sort((a, b) => b[1] - a[1])[0][0] : "-";
  const avgUplift = prompts ? s.upliftSum / prompts : 0;
  const activeDays = Object.keys(s.activity).length;
  const topProjects = Object.entries(s.byProject).sort((a, b) => b[1] - a[1]).slice(0, 3);
  // 52-week heatmap levels (oldest → today, column-major)
  const cells = [];
  const today = new Date();
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const cnt = s.activity[dayStr(d)] || 0;
    cells.push(cnt >= 7 ? 4 : cnt >= 4 ? 3 : cnt >= 2 ? 2 : cnt >= 1 ? 1 : 0);
  }
  const months = [];
  for (let i = 11; i >= 0; i--) {
    months.push(new Date(today.getFullYear(), today.getMonth() - i, 1).toLocaleString("en", {
      month: "short"
    }));
  }
  function pick(seed) {
    setAvatar(seed);
    try {
      localStorage.setItem("ena.avatar", seed);
    } catch (e) {}
    setPicker(false);
  }
  function doShare() {
    const accent = (getComputedStyle(document.querySelector(".bar")).getPropertyValue("--accent") || "#5b54e8").trim();
    const shareStats = [[fmtNum(prompts), "prompts sharpened"], [avgUplift ? "+" + avgUplift.toFixed(1) + "×" : "-", "avg uplift"], [s.streakCur + " days", "current streak"], [s.streakMax + " days", "longest streak"]];
    Promise.all([fetchB64("awards/" + lvl.file + "-192.png"), fetchB64("ena-orb.png"), fetchB64(avUrl(avatar))]).then(a => makeSharePNG({
      accent,
      med: a[0],
      logo: a[1],
      av: a[2],
      name: name || "you",
      levelName: lvl.name,
      stats: shareStats,
      cells
    })).then(dataUrl => HONE.saveImage("ena-stats.png", dataUrl)).then(() => flash && flash("Saved to Downloads")).catch(() => flash && flash("Couldn't save the image"));
  }
  const Folder = /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinejoin: "round"
  }));
  return /*#__PURE__*/React.createElement("div", {
    className: "bar__panel sc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sc__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sc__avwrap"
  }, /*#__PURE__*/React.createElement("button", {
    className: "sc__av",
    title: "Change avatar",
    onClick: () => setPicker(p => !p)
  }, /*#__PURE__*/React.createElement("img", {
    src: avUrl(avatar),
    alt: ""
  })), picker && /*#__PURE__*/React.createElement("div", {
    className: "av__pop",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("p", {
    className: "av__pophd"
  }, "Choose your avatar"), /*#__PURE__*/React.createElement("div", {
    className: "av__grid"
  }, AV_SEEDS.map(sd => /*#__PURE__*/React.createElement("button", {
    key: sd,
    className: "av__opt" + (sd === avatar ? " on" : ""),
    onClick: () => pick(sd)
  }, /*#__PURE__*/React.createElement("img", {
    src: avUrl(sd),
    alt: ""
  })))))), /*#__PURE__*/React.createElement("div", {
    className: "sc__id"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sc__nm"
  }, name || "you")), /*#__PURE__*/React.createElement("button", {
    className: "sc__lvl",
    onClick: () => setLevels(true)
  }, /*#__PURE__*/React.createElement("img", {
    className: "sc__lvlimg",
    src: "awards/" + lvl.file + "-96.png",
    alt: ""
  }), " ", lvl.name, " ", /*#__PURE__*/React.createElement("svg", {
    className: "sc__chev",
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M9 6l6 6-6 6",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("button", {
    className: "sc__share",
    title: "Share your stats",
    onClick: doShare
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 15V4m0 0L8 8m4-4l4 4",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round"
  }))), /*#__PURE__*/React.createElement("button", {
    className: "bar__txtbtn",
    onClick: onClose
  }, "Done")), /*#__PURE__*/React.createElement("div", {
    className: "sc__tiles"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sc__tile"
  }, /*#__PURE__*/React.createElement("b", null, fmtNum(prompts)), /*#__PURE__*/React.createElement("span", null, "Prompts sharpened")), /*#__PURE__*/React.createElement("div", {
    className: "sc__tile"
  }, /*#__PURE__*/React.createElement("b", null, s.streakCur), /*#__PURE__*/React.createElement("span", null, "Current streak")), /*#__PURE__*/React.createElement("div", {
    className: "sc__tile"
  }, /*#__PURE__*/React.createElement("b", null, s.streakMax), /*#__PURE__*/React.createElement("span", null, "Longest streak")), /*#__PURE__*/React.createElement("div", {
    className: "sc__tile"
  }, /*#__PURE__*/React.createElement("b", null, projCount), /*#__PURE__*/React.createElement("span", null, "Projects indexed")), /*#__PURE__*/React.createElement("div", {
    className: "sc__tile"
  }, /*#__PURE__*/React.createElement("b", null, avgUplift ? "+" + avgUplift.toFixed(1) + "×" : "-"), /*#__PURE__*/React.createElement("span", null, "Avg uplift"))), /*#__PURE__*/React.createElement("div", {
    className: "sc__main"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "sc__h"
  }, "Insights"), /*#__PURE__*/React.createElement("div", {
    className: "sc__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sc__ic"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M13 2L4.5 13.5H11l-1 8.5 9-12H12l1-8Z",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("span", {
    className: "sc__k"
  }, "Favorite style"), /*#__PURE__*/React.createElement("span", {
    className: "sc__v"
  }, favStyle === "-" ? "-" : favStyle.charAt(0).toUpperCase() + favStyle.slice(1))), /*#__PURE__*/React.createElement("div", {
    className: "sc__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sc__ic"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 7h16M4 12h16M4 17h10",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round"
  }))), /*#__PURE__*/React.createElement("span", {
    className: "sc__k"
  }, "Words added"), /*#__PURE__*/React.createElement("span", {
    className: "sc__v"
  }, fmtNum(s.wordsAdded))), /*#__PURE__*/React.createElement("div", {
    className: "sc__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sc__ic"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "5",
    width: "18",
    height: "14",
    rx: "2.2",
    stroke: "currentColor",
    strokeWidth: "1.7"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "10",
    r: "1.6",
    stroke: "currentColor",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 15.5l-4.5-4.5L8 19",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("span", {
    className: "sc__k"
  }, "Images attached"), /*#__PURE__*/React.createElement("span", {
    className: "sc__v"
  }, fmtNum(s.images))), /*#__PURE__*/React.createElement("div", {
    className: "sc__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sc__ic"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3.5",
    y: "5",
    width: "17",
    height: "15",
    rx: "2.5",
    stroke: "currentColor",
    strokeWidth: "1.7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3.5 9h17M8 3.5v3M16 3.5v3",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round"
  }))), /*#__PURE__*/React.createElement("span", {
    className: "sc__k"
  }, "Active days"), /*#__PURE__*/React.createElement("span", {
    className: "sc__v"
  }, fmtNum(activeDays))), /*#__PURE__*/React.createElement("div", {
    className: "sc__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sc__ic"
  }, Folder), /*#__PURE__*/React.createElement("span", {
    className: "sc__k"
  }, "Projects indexed"), /*#__PURE__*/React.createElement("span", {
    className: "sc__v"
  }, projCount))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "sc__h"
  }, "Top agents"), /*#__PURE__*/React.createElement("div", {
    className: "sc__agent"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sc__brand sc__claude"
  }, /*#__PURE__*/React.createElement("img", {
    src: "brands/claude.svg",
    alt: "Claude"
  })), /*#__PURE__*/React.createElement("div", {
    className: "sc__abody"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sc__at"
  }, /*#__PURE__*/React.createElement("span", null, "Claude"), /*#__PURE__*/React.createElement("span", null, pct("claude"), "%")), /*#__PURE__*/React.createElement("div", {
    className: "sc__bar"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: pct("claude") + "%"
    }
  })))), /*#__PURE__*/React.createElement("div", {
    className: "sc__agent"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sc__brand sc__codex"
  }, /*#__PURE__*/React.createElement("img", {
    src: "brands/openai.svg",
    alt: "Codex"
  })), /*#__PURE__*/React.createElement("div", {
    className: "sc__abody"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sc__at"
  }, /*#__PURE__*/React.createElement("span", null, "Codex"), /*#__PURE__*/React.createElement("span", null, pct("codex"), "%")), /*#__PURE__*/React.createElement("div", {
    className: "sc__bar"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: pct("codex") + "%"
    }
  })))), /*#__PURE__*/React.createElement("p", {
    className: "sc__h mt"
  }, "Most enhanced projects"), topProjects.length ? topProjects.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "sc__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sc__ic"
  }, Folder), /*#__PURE__*/React.createElement("span", {
    className: "sc__k"
  }, p[0]), /*#__PURE__*/React.createElement("span", {
    className: "sc__v"
  }, p[1]))) : /*#__PURE__*/React.createElement("div", {
    className: "sc__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sc__k",
    style: {
      color: "var(--ink-3)"
    }
  }, "No projects yet")))), /*#__PURE__*/React.createElement("div", {
    className: "sc__sec"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sc__acthd"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sc__actlbl"
  }, "Enhance activity"), /*#__PURE__*/React.createElement("div", {
    className: "sc__tabs"
  }, [["daily", "Daily"], ["weekly", "Weekly"], ["cumulative", "Cumulative"]].map(t => /*#__PURE__*/React.createElement("button", {
    key: t[0],
    className: tab === t[0] ? "on" : "",
    onClick: () => setTab(t[0])
  }, t[1])))), /*#__PURE__*/React.createElement("div", {
    className: "sc__heatwrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sc__heat"
  }, cells.map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "sc__c" + (l ? " sc__c" + l : "")
  }))), /*#__PURE__*/React.createElement("div", {
    className: "sc__months"
  }, months.map((m, i) => /*#__PURE__*/React.createElement("span", {
    key: i
  }, m))))), levels && /*#__PURE__*/React.createElement("div", {
    className: "lv"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lv__top"
  }, /*#__PURE__*/React.createElement("button", {
    className: "lv__back",
    onClick: () => setLevels(false)
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M15 6l-6 6 6 6",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), " Back"), /*#__PURE__*/React.createElement("span", {
    className: "lv__title"
  }, "Levels")), /*#__PURE__*/React.createElement("div", {
    className: "lv__cur"
  }, /*#__PURE__*/React.createElement("img", {
    className: "lv__curaward",
    src: "awards/" + lvl.file + "-192.png",
    alt: ""
  }), /*#__PURE__*/React.createElement("div", {
    className: "lv__curbody"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lv__curname"
  }, lvl.name), /*#__PURE__*/React.createElement("div", {
    className: "lv__curbar"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: (nextLvl ? Math.round((prompts - lvl.req) / (nextLvl.req - lvl.req) * 100) : 100) + "%"
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "lv__curmeta"
  }, nextLvl ? fmtNum(prompts) + " / " + fmtNum(nextLvl.req) + " · " + fmtNum(nextLvl.req - prompts) + " prompts to " + nextLvl.name : "Max level reached"))), /*#__PURE__*/React.createElement("div", {
    className: "lv__list"
  }, LEVELS.map(l => {
    const st = l.n < lvl.n ? "done" : l.n === lvl.n ? "cur" : "lock";
    const req = st === "done" ? "Unlocked" : st === "cur" ? "Current" : fmtNum(l.req) + " prompts";
    return /*#__PURE__*/React.createElement("div", {
      key: l.n,
      className: "lv__row " + st
    }, /*#__PURE__*/React.createElement("span", {
      className: "lv__awardwrap"
    }, /*#__PURE__*/React.createElement("img", {
      className: "lv__award",
      src: "awards/" + l.file + "-96.png",
      alt: ""
    }), st === "lock" && /*#__PURE__*/React.createElement("span", {
      className: "lv__lock"
    }, /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      fill: "none"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "5",
      y: "11",
      width: "14",
      height: "9",
      rx: "2",
      stroke: "currentColor",
      strokeWidth: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M8 11V8a4 4 0 0 1 8 0v3",
      stroke: "currentColor",
      strokeWidth: "2"
    })))), /*#__PURE__*/React.createElement("span", {
      className: "lv__nm"
    }, l.name), /*#__PURE__*/React.createElement("span", {
      className: "lv__req"
    }, req));
  }))));
}

/* ============================ the bar ============================ */
function FloatingBar({
  variant = "native",
  initialView = "resting",
  initialStyle = "balanced",
  loopIndex = false,
  onCollapse
}) {
  const PROJECT = HONE.PROJECT;
  const projViews = ["result", "variations", "diff", "summary", "typing"];
  const startProject = projViews.includes(initialView) || initialView === "indexing" ? PROJECT : PROJECT || null;
  const seeded = ["result", "variations", "diff"].includes(initialView);
  const startDraft = seeded ? HONE.PROJ_DRAFT : initialView === "typing" ? HONE.PROJ_DRAFT : "";
  const [view, setView] = useState(initialView);
  const [project, setProject] = useState(startProject);
  const [draft, setDraft] = useState(startDraft);
  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [style, setStyle] = useState(() => {
    try {
      const s = localStorage.getItem("ena.style");
      return STYLE_OPTS.some(o => o.v === s) ? s : initialStyle;
    } catch (e) {
      return initialStyle;
    }
  });
  const [result, setResult] = useState(seeded ? HONE.PROJ_SAMPLE[initialStyle] : "");
  const [tab, setTab] = useState(initialView === "variations" ? "variations" : initialView === "diff" ? "diff" : "enhanced");
  const [pickedVar, setPickedVar] = useState(initialStyle);
  const [results, setResults] = useState(seeded ? HONE.PROJ_SAMPLE : null);
  const [diffTokens, setDiffTokens] = useState(HONE.PROJ_DIFF || []);
  const [editing, setEditing] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(initialView === "summary");
  const [pct, setPct] = useState(initialView === "indexing" ? 0 : 100);
  const [provider, setProvider] = useState(() => {
    try {
      return localStorage.getItem("ena.provider") || "claude";
    } catch (e) {
      return "claude";
    }
  });
  const [reindexLive, setReindexLive] = useState(() => {
    try {
      return localStorage.getItem("ena.reindexLive") !== "0";
    } catch (e) {
      return true;
    }
  });
  const [alwaysDiff, setAlwaysDiff] = useState(() => {
    try {
      return localStorage.getItem("ena.alwaysDiff") === "1";
    } catch (e) {
      return false;
    }
  });
  const [toast, setToast] = useState(null);
  function setProviderPersist(p) {
    setProvider(p);
    try {
      localStorage.setItem("ena.provider", p);
    } catch (e) {}
  }
  function setReindexLivePersist(v) {
    setReindexLive(v);
    try {
      localStorage.setItem("ena.reindexLive", v ? "1" : "0");
    } catch (e) {}
  }
  function setAlwaysDiffPersist(v) {
    setAlwaysDiff(v);
    try {
      localStorage.setItem("ena.alwaysDiff", v ? "1" : "0");
    } catch (e) {}
  }
  const [instructions, setInstructionsState] = useState(() => {
    try {
      return localStorage.getItem("ena.instructions") || "";
    } catch (e) {
      return "";
    }
  });
  const [profile, setProfile] = useState({
    name: "you"
  });
  useEffect(() => {
    if (HONE.getProfile) HONE.getProfile().then(p => p && p.name && setProfile(p)).catch(() => {});
  }, []);
  function saveInstructions(v) {
    setInstructionsState(v);
    try {
      localStorage.setItem("ena.instructions", v);
    } catch (e) {}
  }
  const [orbMode, setOrbMode] = useState(() => {
    try {
      return localStorage.getItem("ena.orbMode") !== "0";
    } catch (e) {
      return true;
    }
  });
  const [soundsOn, setSoundsOn] = useState(() => {
    try {
      return localStorage.getItem("ena.sounds") !== "0";
    } catch (e) {
      return true;
    }
  });
  function setSoundsPersist(v) {
    setSoundsOn(v);
    try {
      localStorage.setItem("ena.sounds", v ? "1" : "0");
    } catch (e) {}
  }
  const [theme, setThemeState] = useState(() => HONE.getTheme());
  const [accent, setAccentState] = useState(() => HONE.getAccent());
  function chooseTheme(t) {
    setThemeState(t);
    HONE.setTheme(t);
  }
  function chooseAccent(a) {
    setAccentState(a);
    HONE.setAccent(a);
  }
  const [hotkey, setHotkeyState] = useState(() => {
    try {
      return localStorage.getItem("ena.hotkey") || "Alt+Space";
    } catch (e) {
      return "Alt+Space";
    }
  });
  const [recording, setRecording] = useState(false);
  function accelFromEvent(e) {
    const mods = [];
    if (e.metaKey) mods.push("Cmd");
    if (e.ctrlKey) mods.push("Ctrl");
    if (e.altKey) mods.push("Alt");
    if (e.shiftKey) mods.push("Shift");
    const c = e.code;
    let key = "";
    if (c === "Space") key = "Space";else if (/^Key[A-Z]$/.test(c)) key = c.slice(3);else if (/^Digit[0-9]$/.test(c)) key = c.slice(5);else if (/^F\d{1,2}$/.test(c)) key = c;else if (c === "ArrowUp" || c === "ArrowDown" || c === "ArrowLeft" || c === "ArrowRight") key = c.slice(5);
    if (!key) return null; // only modifiers pressed so far
    if (mods.length === 0 && !/^F\d/.test(key)) return null; // need a modifier (or an F-key)
    return mods.concat(key).join("+");
  }
  function recordHotkey(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      setRecording(false);
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const accel = accelFromEvent(e);
    if (!accel) return;
    HONE.setHotkey(accel).then(() => {
      setHotkeyState(accel);
      try {
        localStorage.setItem("ena.hotkey", accel);
      } catch (x) {}
      setRecording(false);
      flash("Shortcut updated");
    }).catch(err => {
      setRecording(false);
      flash(typeof err === "string" ? err : "Couldn't set that shortcut");
    });
  }
  function keySymbol(t) {
    return {
      Cmd: "⌘",
      Super: "⌘",
      Ctrl: "⌃",
      Alt: "⌥",
      Shift: "⇧"
    }[t] || t;
  }
  function toggleOrbMode() {
    const nv = !orbMode;
    setOrbMode(nv);
    try {
      localStorage.setItem("ena.orbMode", nv ? "1" : "0");
    } catch (e) {}
    try {
      window.dispatchEvent(new CustomEvent("ena-orbmode", {
        detail: nv
      }));
    } catch (e) {}
  }
  const tRef = useRef(null),
    iRef = useRef(null),
    inputRef = useRef(null),
    orbRef = useRef(null),
    enhanceIdRef = useRef(0);
  useEffect(() => () => {
    clearTimeout(tRef.current);
    clearInterval(iRef.current);
  }, []);
  function flash(msg) {
    setToast(msg);
    clearTimeout(tRef.current);
    tRef.current = setTimeout(() => setToast(null), 1400);
  }

  /* ---- real folder indexing (cosmetic progress while the backend works) ---- */
  function startIndex(folder) {
    const path = typeof folder === "string" ? folder : folder && (folder.real || folder.path);
    if (!path) {
      setView("resting");
      setSummaryOpen(false);
      return;
    }
    // Stale-while-revalidate: show a cached digest instantly, then re-walk in the background.
    HONE.loadCachedIndex(path).then(cached => {
      if (cached && cached.engine === "agent") {
        clearInterval(iRef.current);
        setProject(cached);
        HONE.addRecent(cached, path);
        setSummaryOpen(true);
        setView("summary");
        setPct(100);
        return; // real agent index already cached → show instantly
      }
      // no cache, or a stale pre-agent scan → the agent actually reads the repo now
      const nm = path.split("/").filter(Boolean).pop() || "project";
      setProject({
        name: nm,
        path: path,
        real_path: path,
        files: 0,
        loc: "…",
        langs: [],
        stack: [],
        structure: [],
        conventions: [],
        context: ""
      });
      setView("indexing");
      setPct(0);
      clearInterval(iRef.current);
      iRef.current = setInterval(() => {
        setPct(p => p < 92 ? p + (p < 60 ? 0.8 : 0.3) : p);
      }, 150);
      HONE.analyzeProject(path, provider).then(proj => {
        clearInterval(iRef.current);
        setPct(100);
        setProject(proj);
        HONE.addRecent(proj, path);
        setTimeout(() => {
          setSummaryOpen(true);
          setView("summary");
        }, 400);
      }).catch(e => {
        clearInterval(iRef.current);
        flash(typeof e === "string" ? e : "Indexing failed");
        setProject(null);
        setView("resting");
      });
    });
  }

  // Explicit re-index from the Summary panel - shows the indexing animation so
  // there's clear feedback (the silent background refresh felt like nothing).
  function reindexProject() {
    const p = project && (project.real_path || project.path);
    if (!p) {
      flash("No folder to re-index");
      return;
    }
    setView("indexing");
    setPct(0);
    clearInterval(iRef.current);
    iRef.current = setInterval(() => {
      setPct(x => x < 92 ? x + (x < 60 ? 0.8 : 0.3) : x);
    }, 150);
    HONE.analyzeProject(p, provider).then(fresh => {
      clearInterval(iRef.current);
      setPct(100);
      setProject(fresh);
      HONE.addRecent(fresh, p);
      flash("Re-indexed " + fresh.name);
      setTimeout(() => {
        setSummaryOpen(true);
        setView("summary");
      }, 400);
    }).catch(e => {
      clearInterval(iRef.current);
      flash(typeof e === "string" ? e : "Re-index failed");
      setView("summary");
    });
  }

  /* ---- enhance (real model call via backend, 3 variations in one shot) ---- */
  function sampleFor(s) {
    return results ? results[s] || "" : "";
  }
  function enhanceWith(text, useStyle) {
    const d = clean(text);
    if (!d) {
      inputRef.current && inputRef.current.focus();
      return;
    }
    const st = useStyle || style;
    if (text !== draft) setDraft(text);
    if (useStyle) setStyle(st);
    setEditing(false);
    setView("enhancing");
    clearTimeout(tRef.current);
    const myId = ++enhanceIdRef.current; // cancel token for this run
    const live = () => enhanceIdRef.current === myId;
    // The agent reads the live files in the repo at enhance time, so the cached
    // digest is just a head-start - no need to re-walk first.
    const proj = project;
    HONE.enhanceAll(d, proj && proj.context, provider, images, proj && proj.real_path, instructions).then(r => {
      if (!live()) return; // cancelled - drop the result
      setResults(r);
      const out = r[st] || r.balanced || "";
      setResult(out);
      setDiffTokens(HONE.makeDiff(d, out));
      setTab(alwaysDiff ? "diff" : "enhanced");
      setView("result");
      HONE.playCue("ready", 0.5);
      HONE.addHistory(d, st, proj ? proj.name : "");
      bumpStats({
        provider: provider,
        style: st,
        projectName: proj ? proj.name : "",
        draft: d,
        enhanced: out,
        images: (images || []).length
      });
    }).catch(e => {
      if (!live()) return;
      HONE.playCue("error", 0.4);
      flash(typeof e === "string" ? e : "Enhance failed");
      setView(d ? "typing" : "resting");
    });
  }
  function runEnhance() {
    enhanceWith(draft, null);
  }
  function cancelEnhance() {
    enhanceIdRef.current++;
    setView(clean(draft) ? "typing" : "resting");
    flash("Stopped");
  }
  function bounceOrb() {
    const el = orbRef.current;
    if (!el) return;
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "ena-squash .55s cubic-bezier(.3,.7,.4,1)";
  }
  function onInput(e) {
    const v = e.target.value;
    setDraft(v);
    if (view === "resting" || view === "typing") setView(v.trim() ? "typing" : "resting");
    bounceOrb();
  }
  function onKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      runEnhance();
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      if (view === "enhancing") cancelEnhance();else if (["result", "variations", "diff"].includes(view)) reset();else if (onCollapse) onCollapse(); // resting/typing → collapse to the orb
    }
  }
  function reset() {
    setView("resting");
    setDraft("");
    setResult("");
    setResults(null);
    setDiffTokens([]);
    setEditing(false);
    setImages([]);
  }
  function addImages(paths) {
    const imgs = (paths || []).filter(HONE.isImage);
    if (!imgs.length) return;
    setImages(prev => {
      const seen = new Set(prev);
      imgs.forEach(p => seen.add(p));
      return Array.from(seen).slice(0, 6);
    });
  }
  function removeImage(p) {
    setImages(prev => prev.filter(x => x !== p));
  }
  function attachImages() {
    HONE.pickImages().then(res => addImages(Array.isArray(res) ? res : res ? [res] : [])).catch(() => {});
  }
  useEffect(() => {
    const off = HONE.onFileDrop({
      hover: paths => {
        if ((paths || []).some(HONE.isImage)) setDragOver(true);
      },
      drop: paths => {
        setDragOver(false);
        addImages(paths);
      },
      cancel: () => setDragOver(false)
    });
    return off;
  }, []);
  // Tell the app when ENA is busy (indexing / enhancing) so the collapsed orb can
  // show it's still working - closing to the orb never stops the job.
  useEffect(() => {
    try {
      window.dispatchEvent(new CustomEvent("ena-busy", {
        detail: view === "indexing" || view === "enhancing"
      }));
    } catch (e) {}
  }, [view]);
  function clearProject() {
    setProject(null);
    setSummaryOpen(false);
    if (["summary", "indexing"].includes(view)) setView("resting");
  }
  function pickStyle(s) {
    setStyle(s);
    try {
      localStorage.setItem("ena.style", s);
    } catch (e) {}
    if (results && !editing) {
      const out = results[s] || "";
      setResult(out);
      setDiffTokens(HONE.makeDiff(draft, out));
    }
  }
  const isWorking = ["resting", "typing", "enhancing", "result", "variations", "diff"].includes(view);
  const showCtx = isWorking && view !== "enhancing";
  const placeholder = project ? "Describe a change to " + project.name + "\u2026" : "Describe what you want\u2026";
  return /*#__PURE__*/React.createElement("div", {
    className: "bar bar--" + variant + (view !== "resting" && view !== "typing" ? " is-expanded" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bar__mark"
  }, /*#__PURE__*/React.createElement("img", {
    ref: orbRef,
    className: "bar__orb",
    src: "ena-orb.png",
    alt: "ENA",
    draggable: false
  })), /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    className: "bar__input",
    value: draft,
    placeholder: placeholder,
    onChange: onInput,
    onKeyDown: onKey,
    spellCheck: false
  }), /*#__PURE__*/React.createElement("div", {
    className: "bar__right"
  }, /*#__PURE__*/React.createElement("button", {
    className: "bar__attach",
    onClick: attachImages,
    title: "Attach images"
  }, /*#__PURE__*/React.createElement(IconClip, null)), /*#__PURE__*/React.createElement(ProviderMenu, {
    value: provider,
    onChange: setProviderPersist
  }), /*#__PURE__*/React.createElement("button", {
    className: "bar__pill",
    onClick: () => pickStyle(style === "concise" ? "balanced" : style === "balanced" ? "detailed" : "concise")
  }, /*#__PURE__*/React.createElement("span", null, (STYLE_OPTS.find(o => o.v === style) || STYLE_OPTS[1]).label), /*#__PURE__*/React.createElement(Chevron, null)), /*#__PURE__*/React.createElement("button", {
    className: "bar__go" + (clean(draft) ? " is-ready" : ""),
    onClick: () => view === "enhancing" ? cancelEnhance() : runEnhance(),
    title: view === "enhancing" ? "Stop  (Esc)" : "Enhance  (↩)"
  }, /*#__PURE__*/React.createElement("img", {
    className: "bar__goicon" + (view === "enhancing" ? " bar__goicon--spin" : ""),
    src: "ena-spark.png",
    alt: "Enhance",
    draggable: false
  })), onCollapse && /*#__PURE__*/React.createElement("button", {
    className: "bar__close",
    onClick: () => onCollapse(),
    title: "Close to orb  (Esc)",
    "aria-label": "Close"
  }, /*#__PURE__*/React.createElement(IconClose, {
    size: 15
  })))), images.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "bar__thumbs"
  }, images.map(p => /*#__PURE__*/React.createElement("div", {
    key: p,
    className: "bar__thumb",
    title: HONE.baseName(p)
  }, /*#__PURE__*/React.createElement("img", {
    className: "bar__thumbimg",
    src: HONE.assetUrl(p),
    alt: "",
    draggable: false
  }), /*#__PURE__*/React.createElement("button", {
    className: "bar__thumbx",
    onClick: () => removeImage(p),
    title: "Remove"
  }, /*#__PURE__*/React.createElement(IconClose, {
    size: 11
  }))))), showCtx && /*#__PURE__*/React.createElement("div", {
    className: "bar__ctxwrap"
  }, /*#__PURE__*/React.createElement(ContextStrip, {
    project: project,
    onAdd: () => setView("picker"),
    onClear: clearProject,
    summaryOpen: summaryOpen,
    onToggleSummary: () => {
      setSummaryOpen(!summaryOpen);
      setView(summaryOpen ? "resting" : "summary");
    }
  })), (view === "resting" || view === "typing") && /*#__PURE__*/React.createElement("div", {
    className: "bar__foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__footlinks"
  }, /*#__PURE__*/React.createElement("button", {
    className: "bar__link",
    onClick: () => setView("settings")
  }, /*#__PURE__*/React.createElement(IconGear, null), " Settings"))), view === "indexing" && project && /*#__PURE__*/React.createElement("div", {
    className: "bar__panel"
  }, /*#__PURE__*/React.createElement(IndexBlock, {
    variant: variant,
    project: project,
    pct: pct
  })), view === "picker" && /*#__PURE__*/React.createElement(Picker, {
    onPick: f => startIndex(f),
    onBrowse: () => {
      HONE.pickFolder().then(p => {
        if (p) startIndex(p);
      }).catch(() => flash("Could not open folder picker"));
    },
    onClose: () => setView("resting")
  }), view === "summary" && project && /*#__PURE__*/React.createElement(Summary, {
    project: project,
    onClose: () => {
      setSummaryOpen(false);
      setView("resting");
    },
    onReindex: reindexProject
  }), view === "enhancing" && /*#__PURE__*/React.createElement("div", {
    className: "bar__panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__loadhead"
  }, /*#__PURE__*/React.createElement("img", {
    className: "bar__loadorb",
    src: "ena-spark.png",
    alt: ""
  }), " ", /*#__PURE__*/React.createElement("span", null, "Enhancing")), /*#__PURE__*/React.createElement("div", {
    className: "shim shim--a"
  }), /*#__PURE__*/React.createElement("div", {
    className: "shim shim--b"
  }), /*#__PURE__*/React.createElement("div", {
    className: "shim shim--c"
  })), ["result", "variations", "diff"].includes(view) && /*#__PURE__*/React.createElement("div", {
    className: "bar__panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__tabs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__tabset"
  }, [["enhanced", "Enhanced"], ["variations", "3 variations"], ["diff", "Before · After"]].map(([k, lbl]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: "bar__tab" + (tab === k ? " is-on" : ""),
    onClick: () => setTab(k)
  }, lbl))), /*#__PURE__*/React.createElement("button", {
    className: "bar__iconbtn",
    onClick: reset,
    title: "New (Esc)"
  }, /*#__PURE__*/React.createElement(IconClose, null))), tab === "enhanced" && /*#__PURE__*/React.createElement("div", {
    className: "bar__result"
  }, editing ? /*#__PURE__*/React.createElement("textarea", {
    className: "bar__edit",
    value: result,
    onChange: e => setResult(e.target.value),
    spellCheck: false,
    autoFocus: true
  }) : /*#__PURE__*/React.createElement("div", {
    className: "bar__card"
  }, /*#__PURE__*/React.createElement(RenderPrompt, {
    text: result
  }))), tab === "variations" && /*#__PURE__*/React.createElement(Variations, {
    variant: variant,
    sample: sampleFor,
    picked: pickedVar,
    onPick: v => {
      setPickedVar(v);
      pickStyle(v);
    }
  }), tab === "diff" && /*#__PURE__*/React.createElement("div", {
    className: "bar__result"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__difflead"
  }, "Your draft \xB7 ", /*#__PURE__*/React.createElement("span", null, draft)), /*#__PURE__*/React.createElement("div", {
    className: "bar__card bar__card--diff"
  }, diffTokens.map((tk, i) => {
    const inner = tk.file ? /*#__PURE__*/React.createElement("span", {
      className: "tok tok--file"
    }, /*#__PURE__*/React.createElement(IconFile, {
      size: 11
    }), tk.t) : tk.code ? /*#__PURE__*/React.createElement("code", {
      className: "tok tok--code"
    }, tk.t.replace(/`/g, "")) : tk.t;
    return tk.add ? /*#__PURE__*/React.createElement("mark", {
      key: i,
      className: "diffadd"
    }, inner) : /*#__PURE__*/React.createElement("span", {
      key: i
    }, inner);
  })), /*#__PURE__*/React.createElement("div", {
    className: "bar__difflegend"
  }, /*#__PURE__*/React.createElement("span", {
    className: "diffadd diffadd--chip"
  }, "Added"), " by ENA from ", project ? project.name : "context", " \xB7 ", diffTokens.filter(t => t.file).length, " file refs")), /*#__PURE__*/React.createElement("div", {
    className: "bar__actions"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__actstyle"
  }, /*#__PURE__*/React.createElement(Segmented, {
    small: true,
    value: style,
    onChange: pickStyle,
    options: STYLE_OPTS
  })), /*#__PURE__*/React.createElement("div", {
    className: "bar__actbtns"
  }, /*#__PURE__*/React.createElement("button", {
    className: "bar__act" + (editing ? " is-on" : ""),
    onClick: () => setEditing(!editing)
  }, /*#__PURE__*/React.createElement(IconEdit, null), " ", editing ? "Done" : "Edit"), /*#__PURE__*/React.createElement("button", {
    className: "bar__act",
    onClick: runEnhance
  }, /*#__PURE__*/React.createElement(IconRegen, null), " Regenerate"), /*#__PURE__*/React.createElement("button", {
    className: "bar__act bar__act--primary",
    onClick: () => {
      try {
        navigator.clipboard.writeText(result);
      } catch (e) {}
      HONE.playCue("insert", 0.4);
      flash("Copied to clipboard");
    }
  }, /*#__PURE__*/React.createElement(IconCopy, null), " Copy")))), view === "settings" && /*#__PURE__*/React.createElement("div", {
    className: "bar__panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__tabs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__paneltitle"
  }, /*#__PURE__*/React.createElement(IconGear, null), " Settings"), /*#__PURE__*/React.createElement("button", {
    className: "bar__iconbtn",
    onClick: () => setView("resting")
  }, /*#__PURE__*/React.createElement(IconClose, null))), /*#__PURE__*/React.createElement("div", {
    className: "bar__set"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__setrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__setlbl"
  }, "Your stats", /*#__PURE__*/React.createElement("small", null, "Streaks, levels, activity & your shareable card")), /*#__PURE__*/React.createElement("button", {
    className: "bar__setbtn",
    onClick: () => setView("stats")
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 20V10M10 20V4M16 20v-7M22 20H2",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  })), " View"))), /*#__PURE__*/React.createElement("div", {
    className: "bar__setrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__setlbl"
  }, "Custom instructions", /*#__PURE__*/React.createElement("small", null, "How ENA writes your prompts - applied to every enhance")), /*#__PURE__*/React.createElement("button", {
    className: "bar__setbtn",
    onClick: () => setView("instructions")
  }, instructions.trim() ? /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(IconEdit, {
    size: 13
  }), " Edit") : /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(IconPlus, {
    size: 13
  }), " Add"))), /*#__PURE__*/React.createElement("div", {
    className: "bar__setrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__setlbl"
  }, "Default style", /*#__PURE__*/React.createElement("small", null, "Used when you press \u21A9")), /*#__PURE__*/React.createElement(Segmented, {
    value: style,
    onChange: pickStyle,
    options: STYLE_OPTS,
    small: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "bar__setrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__setlbl"
  }, "Theme", /*#__PURE__*/React.createElement("small", null, "Light, dark, or follow macOS")), /*#__PURE__*/React.createElement(Segmented, {
    value: theme,
    onChange: chooseTheme,
    options: THEME_OPTS,
    small: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "bar__setrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__setlbl"
  }, "Accent", /*#__PURE__*/React.createElement("small", null, "ENA's highlight color")), /*#__PURE__*/React.createElement("div", {
    className: "bar__accents"
  }, ACCENTS.map(a => /*#__PURE__*/React.createElement("button", {
    key: a.v,
    className: "bar__swatch" + (accent === a.v ? " is-on" : ""),
    style: {
      background: a.c
    },
    onClick: () => chooseAccent(a.v),
    title: a.v
  })))), /*#__PURE__*/React.createElement("div", {
    className: "bar__setrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__setlbl"
  }, "Rest as an orb", /*#__PURE__*/React.createElement("small", null, "Keep ENA on screen; \u2325Space opens / closes it")), /*#__PURE__*/React.createElement(Toggle, {
    on: orbMode,
    onClick: toggleOrbMode
  })), /*#__PURE__*/React.createElement("div", {
    className: "bar__setrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__setlbl"
  }, "Sounds", /*#__PURE__*/React.createElement("small", null, "Play cues on launch and when a prompt is ready")), /*#__PURE__*/React.createElement(Toggle, {
    on: soundsOn,
    onClick: () => setSoundsPersist(!soundsOn)
  })), /*#__PURE__*/React.createElement("div", {
    className: "bar__setrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__setlbl"
  }, "Enhance hotkey", /*#__PURE__*/React.createElement("small", null, recording ? "Press a shortcut · Esc to cancel" : "Click to change · summons ENA anywhere")), /*#__PURE__*/React.createElement("button", {
    className: "bar__hotkey" + (recording ? " is-rec" : ""),
    onClick: () => setRecording(true),
    onKeyDown: recording ? recordHotkey : undefined,
    onBlur: () => setRecording(false)
  }, recording ? /*#__PURE__*/React.createElement("span", {
    className: "bar__hotkeyrec"
  }, "Press keys\u2026") : hotkey.split("+").map((t, i) => /*#__PURE__*/React.createElement("kbd", {
    key: i
  }, keySymbol(t))))), /*#__PURE__*/React.createElement("div", {
    className: "bar__setrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__setlbl"
  }, "Re-index on file changes", /*#__PURE__*/React.createElement("small", null, "Keep the project index live")), /*#__PURE__*/React.createElement(Toggle, {
    on: reindexLive,
    onClick: () => setReindexLivePersist(!reindexLive)
  })), /*#__PURE__*/React.createElement("div", {
    className: "bar__setrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__setlbl"
  }, "Index cache", /*#__PURE__*/React.createElement("small", null, "On-device summaries \xB7 clear to force a fresh read")), /*#__PURE__*/React.createElement("button", {
    className: "bar__setbtn",
    onClick: () => HONE.clearIndexCache().then(n => flash("Cleared " + n + " cached " + (n === 1 ? "index" : "indexes"))).catch(() => flash("Couldn't clear the cache"))
  }, "Clear")))), view === "stats" && /*#__PURE__*/React.createElement(Stats, {
    name: profile.name,
    onClose: () => setView("settings"),
    flash: flash
  }), view === "instructions" && /*#__PURE__*/React.createElement("div", {
    className: "bar__panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__tabs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar__paneltitle"
  }, /*#__PURE__*/React.createElement(IconEdit, {
    size: 15
  }), " Custom instructions"), /*#__PURE__*/React.createElement("button", {
    className: "bar__txtbtn",
    onClick: () => setView("settings")
  }, "Done")), /*#__PURE__*/React.createElement("div", {
    className: "bar__picksub"
  }, "Tell ENA how to write your prompts - tone, format, preferences. Applied to every enhance; leave empty for ENA's default style."), /*#__PURE__*/React.createElement("textarea", {
    className: "bar__instrarea",
    value: instructions,
    autoFocus: true,
    rows: 9,
    spellCheck: false,
    placeholder: "e.g.\n• Be terse - no preamble or filler\n• Always target Cursor and end with acceptance criteria\n• Prefer TypeScript + pnpm; never suggest yarn\n• Keep a friendly, direct tone",
    onChange: e => saveInstructions(e.target.value)
  })), dragOver && /*#__PURE__*/React.createElement("div", {
    className: "bar__drop"
  }, /*#__PURE__*/React.createElement(IconClip, {
    size: 22
  }), " Drop images to attach"), toast && /*#__PURE__*/React.createElement("div", {
    className: "bar__toast"
  }, /*#__PURE__*/React.createElement(IconCheck, {
    size: 14
  }), " ", toast));
}
Object.assign(window, {
  FloatingBar,
  Spark,
  IndexBlock,
  IconFolder,
  IconCheck,
  IconPlus,
  IconClose,
  IconFile
});
})();

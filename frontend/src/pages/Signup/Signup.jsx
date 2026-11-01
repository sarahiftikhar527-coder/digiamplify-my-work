import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  Check,
  Loader2,
} from 'lucide-react';

const SIGNUP_IMAGE = '/images/Login/login.webp';
const REMEMBER_KEY = 'digiamplify_remembered_email';

const ROUTES = {
  login: '/login',
};

const ROLES = ['Employee', 'Manager', 'HR'];

const MIN_PASSWORD = 8;
const PIN_REGEX = /^\d{4,6}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const USE_MOCK_SIGNUP = true;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SIGNUP_ENDPOINT = '/auth/register';

const signupRequest = async ({ email, password, role, pin }) => {
  if (USE_MOCK_SIGNUP) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { message: 'Account created' };
  }

  const response = await fetch(`${API_BASE_URL}${SIGNUP_ENDPOINT}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role, pin }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Unable to create account. Please try again.');
  }

  return data;
};

/* ------------------------------------------------------------------
   DESIGN SPEC (all values are px inside the 1920 x 1080 design frame,
   measured from the screenshots). Change numbers here to fine tune.
------------------------------------------------------------------- */
const SPEC = {
  frameW: 1920, // design frame width (black bars outside this)
  frameH: 1080, // design frame height
  leftW: 900, // left image panel width
  rightPadX: 24, // gap between gray edge and card
  rightPadY: 50, // gap above / below card
  cardPadX: 120, // card inner left / right padding (+2px border)
  cardPadTop: 101,
  cardPadBottom: 63,
  inputH: 68,
  labelH: 34,
  labelGap: 12, // label -> input
  fieldGap: 40, // input -> next label
};

const MOBILE_W = 560;
const MOBILE_MIN_SCALE = 0.5;
const MOBILE_MAX_SCALE = 1.15;

const calcStage = (cw, ch) => {
  const desktop = cw >= 1024;

  if (desktop) {
    // Whole 1920 x 1080 frame is scaled to fit the screen, centered,
    // black bars on the sides (page scrolls vertically if taller).
    const scale = Math.min(cw / SPEC.frameW, ch / SPEC.frameH);

    return {
      desktop,
      scale,
      width: SPEC.frameW,
      height: ch / scale,
    };
  }

  const scale = Math.min(
    Math.max(cw / MOBILE_W, MOBILE_MIN_SCALE),
    MOBILE_MAX_SCALE
  );

  return {
    desktop,
    scale,
    width: cw / scale,
    height: ch / scale,
  };
};

const useStage = (containerRef) => {
  const [stage, setStage] = useState(() =>
    calcStage(window.innerWidth, window.innerHeight)
  );

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const update = () => setStage(calcStage(el.clientWidth, el.clientHeight));

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => observer.disconnect();
  }, [containerRef]);

  return stage;
};

const Logo = ({ k = 1 }) => (
  <div
    className="text-center font-bold leading-none tracking-tight text-white"
    style={{ fontSize: 68 * k }}
  >
    DigiA
    <span
      className="inline-flex items-end align-baseline"
      style={{ margin: `0 ${3 * k}px`, gap: 6 * k }}
      aria-hidden="true"
    >
      <span
        className="block bg-[#c1121f]"
        style={{ width: 12 * k, height: 25 * k }}
      />
      <span
        className="block bg-[#c1121f]"
        style={{ width: 12 * k, height: 43 * k }}
      />
      <span
        className="block bg-[#c1121f]"
        style={{ width: 12 * k, height: 57 * k }}
      />
    </span>
    plify<span className="text-[#c1121f]">.</span>
  </div>
);

const inputCls =
  'auth-input h-full w-full min-w-0 bg-transparent text-[20px] font-light text-white outline-none placeholder:text-gray-500';

const InputBox = ({ icon: Icon, hasError, children }) => (
  <div
    className={`flex items-center gap-[14px] rounded-[5px] border bg-[#0b0b0b] pl-[25px] pr-[22px] transition focus-within:border-red-700 ${
      hasError ? 'border-red-600' : 'border-[#4d4d4d]'
    }`}
    style={{ height: SPEC.inputH }}
  >
    <Icon size={26} strokeWidth={1.4} className="shrink-0 text-gray-400" />
    {children}
  </div>
);

const Field = ({ id, label, error, hint, first, children }) => (
  <div style={{ marginTop: first ? 0 : SPEC.fieldGap }}>
    <label
      htmlFor={id}
      className="block text-[24px] font-normal text-white"
      style={{ lineHeight: `${SPEC.labelH}px`, marginBottom: SPEC.labelGap }}
    >
      {label}
    </label>

    {children}

    {error && <p className="mt-1.5 text-[14px] text-red-500">{error}</p>}

    {hint && (
      <p className="mt-[16px] text-[18px] font-light leading-[26px] text-gray-400">
        {hint}
      </p>
    )}
  </div>
);

const PasswordInput = ({
  id,
  value,
  onChange,
  placeholder,
  hasError,
  autoComplete = 'new-password',
  inputMode,
  maxLength,
}) => {
  const [show, setShow] = useState(false);

  return (
    <InputBox icon={Lock} hasError={hasError}>
      <input
        id={id}
        name={id}
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputCls}
      />

      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="shrink-0 text-gray-300 transition hover:text-white"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? (
          <Eye size={26} strokeWidth={1.4} />
        ) : (
          <EyeOff size={26} strokeWidth={1.4} />
        )}
      </button>
    </InputBox>
  );
};

const Agree = ({ checked, onChange, error, children }) => (
  <div>
    <label className="flex cursor-pointer select-none items-center gap-[14px] text-[20px] font-normal leading-[28px] text-white">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />

      <span
        className={`flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[4px] border transition peer-focus-visible:ring-2 peer-focus-visible:ring-red-600 ${
          checked
            ? 'border-[#c1121f] bg-[#c1121f]'
            : error
              ? 'border-red-600'
              : 'border-[#555] bg-transparent'
        }`}
      >
        {checked && <Check size={18} strokeWidth={3} className="text-white" />}
      </span>

      <span>
        {children} <span className="text-[#e10b1f]">*</span>
      </span>
    </label>

    {error && <p className="mt-1 pl-[42px] text-[14px] text-red-500">{error}</p>}
  </div>
);

const Signup = ({ onSignup }) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const { desktop, scale, width, height } = useStage(containerRef);
  const [contentH, setContentH] = useState(0);

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirm: '',
    role: ROLES[0],
    pin: '',
    eula: false,
    privacy: false,
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [serverError, setServerError] = useState('');
  const redirectTimer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(redirectTimer.current);
  }, []);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;

    const update = () => setContentH(el.offsetHeight);

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));

    if (serverError) setServerError('');
  };

  const validate = () => {
    const next = {};

    if (!form.email.trim()) {
      next.email = 'Email is required';
    } else if (!emailRegex.test(form.email.trim())) {
      next.email = 'Enter a valid email address';
    }

    if (!form.password) {
      next.password = 'Password is required';
    } else if (form.password.length < MIN_PASSWORD) {
      next.password = `Password must be at least ${MIN_PASSWORD} characters`;
    }

    if (!form.confirm) {
      next.confirm = 'Please confirm your password';
    } else if (form.confirm !== form.password) {
      next.confirm = 'Passwords do not match';
    }

    if (!ROLES.includes(form.role)) {
      next.role = 'Please select a role';
    }

    if (!form.pin) {
      next.pin = 'PIN is required';
    } else if (!PIN_REGEX.test(form.pin)) {
      next.pin = 'PIN must be 4 to 6 digits';
    }

    if (!form.eula) {
      next.eula = 'You must accept the End User License Agreement';
    }

    if (!form.privacy) {
      next.privacy = 'You must accept the Privacy Policy';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (status === 'loading' || status === 'success' || !validate()) return;

    setStatus('loading');
    setServerError('');

    try {
      const payload = {
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        pin: form.pin,
      };

      if (onSignup) {
        await onSignup(payload);
      } else {
        await signupRequest(payload);
      }

      try {
        localStorage.setItem(REMEMBER_KEY, payload.email);
      } catch {}

      setStatus('success');

      redirectTimer.current = setTimeout(() => {
        navigate(ROUTES.login);
      }, 1400);
    } catch (error) {
      setServerError(
        error?.message || 'Unable to create account. Please try again.'
      );
      setStatus('error');
    }
  };

  const busy = status === 'loading' || status === 'success';

  return (
    <div
      ref={containerRef}
      className={`auth-page fixed inset-0 overflow-y-auto overflow-x-hidden font-['Poppins',sans-serif] ${
        desktop ? 'bg-black' : 'bg-[#383838]'
      }`}
    >
      <style>{`
        .auth-input:-webkit-autofill,
        .auth-input:-webkit-autofill:hover,
        .auth-input:-webkit-autofill:focus,
        .auth-input:-webkit-autofill:active {
          -webkit-text-fill-color: #ffffff;
          -webkit-box-shadow: 0 0 0 1000px #0b0b0b inset;
          caret-color: #ffffff;
          transition: background-color 9999s ease-in-out 0s;
        }

        .auth-input::selection {
          background: rgba(193, 18, 31, 0.5);
        }

        .auth-page {
          scrollbar-width: thin;
          scrollbar-color: #4a4a4a #000000;
        }

        .role-select {
          color-scheme: dark;
        }

        .role-select option {
          background-color: #171717;
          color: #ffffff;
          padding: 12px;
        }
      `}</style>

      <div
        style={{
          width: width * scale,
          height: (contentH || height) * scale,
          margin: '0 auto',
        }}
      >
        <div
          ref={stageRef}
          className="flex"
          style={{
            width,
            minHeight: height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {desktop && (
            <div
              className="relative flex shrink-0 overflow-hidden bg-[#0b0b0b]"
              style={{ width: SPEC.leftW }}
            >
              <img
                src={SIGNUP_IMAGE}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-[#000000B2]" />

              <div
                className="relative flex w-full flex-col justify-between"
                style={{ padding: '153px 80px 146px' }}
              >
                <div className="flex flex-col items-center">
                  <Logo />

                  <p className="mt-[45px] text-[22px] font-semibold leading-[32px] text-[#e10b1f]">
                    Employee Portal
                  </p>
                </div>

                <div>
                  <h2 className="text-[28px] font-semibold leading-[45px] text-white">
                    One Platform.
                  </h2>

                  <h2 className="text-[28px] font-semibold leading-[45px] text-[#e10b1f]">
                    Everything You Need.
                  </h2>

                  <p className="mt-[20px] max-w-[580px] text-[23px] font-light leading-[35px] text-gray-300">
                    Access your dashboard, manage your tasks track performance and
                    stay connected.
                  </p>

                  <div className="mt-[50px] flex items-center gap-[19px] text-[20px] font-medium leading-[24px] text-white">
                    <ShieldCheck size={24} strokeWidth={1.5} />
                    <span>Secure. Reliable. Always.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            className="flex min-w-0 flex-1 flex-col items-center justify-center bg-[#383838]"
            style={{
              padding: desktop
                ? `${SPEC.rightPadY}px ${SPEC.rightPadX}px`
                : '20px 16px',
            }}
          >
            {!desktop && (
              <div className="mb-[24px] mt-[8px] flex shrink-0 flex-col items-center">
                <Logo k={0.9} />

                <p className="mt-[14px] text-[20px] font-semibold text-[#e10b1f]">
                  Employee Portal
                </p>
              </div>
            )}

            <div className="w-full" style={{ maxWidth: desktop ? undefined : 900 }}>
              <div
                className="w-full rounded-[24px] border-2 border-[#4a4a4a] bg-[#0b0b0b]"
                style={{
                  paddingLeft: desktop ? SPEC.cardPadX : 28,
                  paddingRight: desktop ? SPEC.cardPadX : 28,
                  paddingTop: desktop ? SPEC.cardPadTop : 30,
                  paddingBottom: desktop ? SPEC.cardPadBottom : 30,
                }}
              >
                <div className="flex justify-center">
                  <span className="flex h-[76px] w-[76px] items-center justify-center rounded-[8px] border border-red-700 bg-[#1a0808] text-[#e10b1f]">
                    <User size={40} strokeWidth={1.5} />
                  </span>
                </div>

                <h1 className="mt-[20px] text-center text-[36px] font-bold leading-[50px] text-white">
                  Create Account
                </h1>

                <p className="mt-[3px] text-center text-[22px] font-light leading-[32px] text-gray-400">
                  Sign in to manage the operation
                </p>

                <form onSubmit={handleSubmit} noValidate className="mt-[52px]">
                  <Field
                    id="email"
                    label="Email Address"
                    error={errors.email}
                    first
                  >
                    <InputBox icon={Mail} hasError={!!errors.email}>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) => setField('email', e.target.value)}
                        placeholder="Enter email here"
                        className={inputCls}
                      />
                    </InputBox>
                  </Field>

                  <Field
                    id="password"
                    label="Create Password"
                    error={errors.password}
                  >
                    <PasswordInput
                      id="password"
                      value={form.password}
                      onChange={(e) => setField('password', e.target.value)}
                      placeholder="Enter password here"
                      hasError={!!errors.password}
                    />
                  </Field>

                  <Field
                    id="confirm"
                    label="Confirm Password"
                    error={errors.confirm}
                  >
                    <PasswordInput
                      id="confirm"
                      value={form.confirm}
                      onChange={(e) => setField('confirm', e.target.value)}
                      placeholder="Enter password here"
                      hasError={!!errors.confirm}
                    />
                  </Field>

                  <Field id="role" label="Role" error={errors.role}>
                    <InputBox icon={User} hasError={!!errors.role}>
                      <select
                        id="role"
                        name="role"
                        value={form.role}
                        onChange={(e) => setField('role', e.target.value)}
                        className="role-select auth-input h-full w-full cursor-pointer appearance-none bg-transparent text-[20px] font-light text-gray-400 outline-none"
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </InputBox>
                  </Field>

                  <Field
                    id="pin"
                    label="Create Pin (4-6 digits )"
                    error={errors.pin}
                    hint="Used to clock in/out on the time clock terminal."
                  >
                    <PasswordInput
                      id="pin"
                      value={form.pin}
                      onChange={(e) =>
                        setField(
                          'pin',
                          e.target.value.replace(/\D/g, '').slice(0, 6)
                        )
                      }
                      placeholder="••••"
                      hasError={!!errors.pin}
                      autoComplete="off"
                      inputMode="numeric"
                      maxLength={6}
                    />
                  </Field>

                  <div className="mt-[56px] space-y-[28px]">
                    <Agree
                      checked={form.eula}
                      onChange={(e) => setField('eula', e.target.checked)}
                      error={errors.eula}
                    >
                      I agree to the End User License Agreement
                    </Agree>

                    <Agree
                      checked={form.privacy}
                      onChange={(e) => setField('privacy', e.target.checked)}
                      error={errors.privacy}
                    >
                      I agree to the Privacy Policy
                    </Agree>
                  </div>

                  {serverError && (
                    <p
                      role="alert"
                      className="mt-5 rounded border border-red-900/70 bg-red-950/40 px-4 py-3 text-[14px] text-red-400"
                    >
                      {serverError}
                    </p>
                  )}

                  {status === 'success' && (
                    <p
                      role="status"
                      className="mt-5 rounded border border-green-900/70 bg-green-950/40 px-4 py-3 text-[14px] text-green-400"
                    >
                      Account created successfully! Redirecting to login...
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="mt-[56px] flex h-[64px] w-full items-center justify-center gap-2.5 rounded-[4px] bg-gradient-to-r from-[#c1121f] via-[#a30f1a] to-[#5c0a10] text-[24px] font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {status === 'loading' && (
                      <Loader2 size={24} className="animate-spin" />
                    )}

                    {status === 'loading' ? 'Creating account...' : 'Sign up'}
                  </button>

                  <p className="mt-[26px] text-center text-[22px] font-normal leading-[28px] text-white">
                    Already have account?{' '}
                    <Link
                      to={ROUTES.login}
                      className="font-medium text-[#e10b1f] transition hover:text-red-500"
                    >
                      Login
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

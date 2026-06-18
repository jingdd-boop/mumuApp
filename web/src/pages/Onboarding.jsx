import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { todayStr } from '../utils/confinement';
import * as api from '../api';

const DAY_OPTIONS = [
  { value: 28, label: '28 天' },
  { value: 30, label: '30 天' },
  { value: 42, label: '42 天' },
];

const DELIVERY_OPTIONS = [
  { value: 'natural', label: '顺产' },
  { value: 'cesarean', label: '剖腹产' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { ensureLogin, refreshProfile } = useAuth();
  const [nickName, setNickName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [totalDays, setTotalDays] = useState(42);
  const [deliveryType, setDeliveryType] = useState('natural');
  const [agreedDisclaimer, setAgreedDisclaimer] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    ensureLogin()
      .then(() => api.getProfileStatus())
      .then((status) => {
        if (!status.mom) return;
        const settings = status.settings || {};
        setNickName(status.mom.nickName || '');
        setDeliveryDate(status.mom.deliveryDate || '');
        setTotalDays(settings.totalDays || 42);
        setDeliveryType(settings.deliveryType || 'natural');
      });
  }, [ensureLogin]);

  const onSubmit = async () => {
    if (!nickName.trim()) {
      alert('请输入你的称呼');
      return;
    }
    if (!deliveryDate) {
      alert('请选择生产日期');
      return;
    }
    if (!agreedDisclaimer || !agreedPrivacy) {
      alert('请阅读并同意相关协议');
      return;
    }

    setSubmitting(true);
    try {
      await ensureLogin();
      await api.postOnboarding({
        nickName: nickName.trim(),
        deliveryDate,
        totalDays,
        deliveryType,
        agreedDisclaimer,
        agreedPrivacy,
      });
      await refreshProfile();
      navigate('/', { replace: true });
    } catch (err) {
      alert(err.message || '保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="初始设置" />

      <div className="onboarding-header">
        <div className="onboarding-title">欢迎来到沐沐记</div>
        <div className="onboarding-subtitle">填写基本信息，开始记录你的月子恢复</div>
      </div>

      <div className="card">
        <div className="form-item">
          <label className="form-label">你的称呼</label>
          <input
            className="input"
            placeholder="如：沐沐、小雨"
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
            maxLength={20}
          />
        </div>

        <div className="form-item">
          <label className="form-label">生产日期</label>
          <input
            className="input"
            type="date"
            value={deliveryDate}
            max={todayStr()}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />
        </div>

        <div className="form-item">
          <label className="form-label">月子天数</label>
          <div className="tag-group">
            {DAY_OPTIONS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`tag${totalDays === item.value ? ' active' : ''}`}
                onClick={() => setTotalDays(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-item">
          <label className="form-label">分娩方式</label>
          <div className="tag-group">
            {DELIVERY_OPTIONS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`tag${deliveryType === item.value ? ' active' : ''}`}
                onClick={() => setDeliveryType(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="agreement">
        <label className="agreement-item">
          <input
            type="checkbox"
            checked={agreedDisclaimer}
            onChange={(e) => setAgreedDisclaimer(e.target.checked)}
          />
          <span>我已阅读并同意</span>
          <Link to="/legal/disclaimer" className="agreement-link">《免责声明》</Link>
        </label>
        <label className="agreement-item">
          <input
            type="checkbox"
            checked={agreedPrivacy}
            onChange={(e) => setAgreedPrivacy(e.target.checked)}
          />
          <span>我已阅读并同意</span>
          <Link to="/legal/privacy" className="agreement-link">《隐私政策》</Link>
        </label>
      </div>

      <button type="button" className="btn-primary" onClick={onSubmit} disabled={submitting}>
        {submitting ? '保存中…' : '开始使用'}
      </button>
    </>
  );
}

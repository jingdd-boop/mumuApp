import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function Settings() {
  const navigate = useNavigate();
  const { ensureLogin, refreshProfile } = useAuth();
  const [nickName, setNickName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [totalDays, setTotalDays] = useState(42);
  const [deliveryType, setDeliveryType] = useState('natural');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    ensureLogin()
      .then(() => api.getProfileStatus())
      .then((status) => {
        const mom = status.mom || {};
        const settings = status.settings || {};
        setNickName(mom.nickName || '');
        setDeliveryDate(mom.deliveryDate || '');
        setTotalDays(settings.totalDays || 42);
        setDeliveryType(settings.deliveryType || 'natural');
      });
  }, [ensureLogin]);

  const onSave = async () => {
    if (!nickName.trim()) {
      alert('请输入你的称呼');
      return;
    }
    if (!deliveryDate) {
      alert('请选择生产日期');
      return;
    }

    setSubmitting(true);
    try {
      await Promise.all([
        api.putMom({ nickName: nickName.trim(), deliveryDate }),
        api.putSettings({ totalDays, deliveryType }),
      ]);
      await refreshProfile();
      navigate(-1);
    } catch (err) {
      alert(err.message || '保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="档案与设置" showBack onBack={() => navigate(-1)} />

      <div className="card">
        <div className="form-item">
          <label className="form-label">你的称呼</label>
          <input
            className="input"
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

      <button type="button" className="btn-primary" onClick={onSave} disabled={submitting}>
        {submitting ? '保存中…' : '保存设置'}
      </button>
    </>
  );
}

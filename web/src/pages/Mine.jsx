import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';

export default function Mine() {
  const navigate = useNavigate();
  const { ensureLogin, refreshProfile } = useAuth();
  const [nickName, setNickName] = useState('');
  const [confinementText, setConfinementText] = useState('');
  const [recordCount, setRecordCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureLogin()
      .then(() => Promise.all([api.getProfileStatus(), api.getStatsSummary()]))
      .then(([status, summary]) => {
        if (!status.mom) {
          setNickName('未设置');
          setConfinementText('');
          setRecordCount(0);
        } else {
          setNickName(status.mom.nickName);
          setConfinementText(summary.confinementText || '');
          setRecordCount(summary.momRecordCount || 0);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [ensureLogin]);

  const onClearData = () => {
    if (!window.confirm('将删除个人档案、所有记录和设置，此操作不可恢复。确定继续吗？')) return;
    api
      .deleteAllData()
      .then(() => refreshProfile())
      .then(() => {
        navigate('/onboarding', { replace: true });
      })
      .catch((err) => alert(err.message));
  };

  if (loading) return <div className="loading-screen">加载中…</div>;

  return (
    <>
      <PageHeader title="我的" subtitle="个人中心" />

      <div className="card profile-card">
        <div className="profile-avatar">🌸</div>
        <div className="profile-name">{nickName}</div>
        {confinementText && <div className="profile-meta">{confinementText}</div>}
        <div className="profile-meta" style={{ marginTop: 4 }}>共 {recordCount} 条记录</div>
      </div>

      <div className="menu-list">
        <button type="button" className="menu-item" onClick={() => navigate('/settings')}>
          <span>档案与设置</span>
          <span className="menu-arrow">›</span>
        </button>
        <button type="button" className="menu-item" onClick={() => navigate('/legal/disclaimer')}>
          <span>免责声明</span>
          <span className="menu-arrow">›</span>
        </button>
        <button type="button" className="menu-item" onClick={() => navigate('/legal/privacy')}>
          <span>隐私政策</span>
          <span className="menu-arrow">›</span>
        </button>
      </div>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <button type="button" className="btn-danger" onClick={onClearData}>
          清除所有数据
        </button>
      </div>
    </>
  );
}

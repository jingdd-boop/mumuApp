import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';

export default function LegalPrivacy() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="隐私政策" showBack onBack={() => navigate(-1)} />

      <div className="card">
        <div className="legal-date">更新日期：2026年6月17日</div>

        <div className="legal-section">
          <div className="legal-heading">一、信息收集</div>
          <div className="legal-text">
            我们可能收集您主动提供的信息，包括称呼、生产日期、月子设置及健康记录数据。这些信息用于提供个性化服务和数据展示。
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-heading">二、信息使用</div>
          <div className="legal-text">
            收集的信息仅用于本应用的功能实现，包括月子进度计算、记录存储、趋势分析和内容推荐。我们不会将您的个人信息用于其他商业目的。
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-heading">三、信息存储</div>
          <div className="legal-text">
            您的数据存储在安全的服务器上。我们采取合理的技术措施保护数据安全，但无法保证绝对安全。
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-heading">四、信息共享</div>
          <div className="legal-text">
            我们不会向第三方出售、交易或转让您的个人信息，除非获得您的明确同意或法律法规要求。
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-heading">五、您的权利</div>
          <div className="legal-text">
            您可以随时在「我的」页面清除所有数据。清除后，您的档案、记录和设置将被永久删除且不可恢复。
          </div>
        </div>
      </div>
    </>
  );
}

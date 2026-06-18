import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';

export default function LegalDisclaimer() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="免责声明" showBack onBack={() => navigate(-1)} />

      <div className="card">
        <div className="legal-date">更新日期：2026年6月17日</div>

        <div className="legal-section">
          <div className="legal-heading">一、服务性质</div>
          <div className="legal-text">
            「沐沐记」是一款面向产后家庭的生活记录与信息参考工具。本应用提供的月子天数计算、每日建议、记录功能及文章内容，均仅供一般性参考，不构成任何医疗诊断、治疗建议或处方。
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-heading">二、非医疗建议</div>
          <div className="legal-text">
            本应用不对任何健康问题作出诊断或提供治疗方案。如出现以下情况，请立即就医：
          </div>
          <div className="legal-list">· 持续高热（体温 ≥ 38.5°C）</div>
          <div className="legal-list">· 大量或异常出血</div>
          <div className="legal-list">· 严重伤口红肿、化脓或剧烈疼痛</div>
          <div className="legal-list">· 持续情绪低落或有自伤念头</div>
        </div>

        <div className="legal-section">
          <div className="legal-heading">三、内容准确性</div>
          <div className="legal-text">
            我们尽力确保内容的科学性与时效性，但不保证内容的完整、准确或适用于每个个体。不同体质、分娩方式及医疗条件存在差异，请以专业医疗机构的意见为准。
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-heading">四、用户记录数据</div>
          <div className="legal-text">
            您在本应用中录入的喂养、睡眠、身体恢复等记录，仅为个人生活备忘用途。我们不对基于这些记录做出的任何判断或决策承担责任。
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-heading">五、责任限制</div>
          <div className="legal-text">
            在法律允许的范围内，我们对因使用或无法使用本应用而产生的任何直接、间接、附带或后果性损害不承担责任。
          </div>
        </div>
      </div>
    </>
  );
}

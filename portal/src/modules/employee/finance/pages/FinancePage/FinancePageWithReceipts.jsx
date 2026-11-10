import FinancePage from './FinancePage';
import MyReceiptsSection from '../../components/MyReceiptsSection/MyReceiptsSection';

export default function FinancePageWithReceipts() {
  return (
    <>
      <FinancePage />
      <div className="px-6 pb-8">
        <MyReceiptsSection />
      </div>
    </>
  );
}
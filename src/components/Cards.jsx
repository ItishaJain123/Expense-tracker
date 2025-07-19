import { Card, Row, Col } from "antd";
import Button from "./Button";

const Cards = ({
  currentBalance,
  income,
  expense,
  showExpenseModal,
  showIncomeModal,
  showResetModal,
}) => {
  return (
    <div>
      <Row gutter={[24, 24]} justify="center">
        <Col xs={24} sm={12} lg={8}>
          <Card
            bordered={false}
            className="rounded-xl bg-[#1e3a8a] text-white shadow-lg border border-blue-400 hover:shadow-2xl transition-all duration-300"
          >
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              💼 Current Balance
            </h2>
            <p className="text-4xl font-bold">Rs {currentBalance}</p>
            <div className="mt-6">
              <Button
                text="Reset Balance"
                onClick={showResetModal}
                fullWidth
                blue
              />
            </div>
          </Card>
        </Col>

        {/* Total Income */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            bordered={false}
            className="rounded-xl bg-[#065f46] text-white shadow-lg border border-emerald-400 hover:shadow-2xl transition-all duration-300"
          >
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              🪙 Total Income
            </h2>
            <p className="text-4xl font-bold">Rs {income}</p>
            <div className="mt-6">
              <Button
                text="Add Income"
                onClick={showIncomeModal}
                fullWidth
                blue
              />
            </div>
          </Card>
        </Col>

        {/* Total Expense */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            bordered={false}
            className="rounded-xl bg-[#7f1d1d] text-white shadow-lg border border-rose-400 hover:shadow-2xl transition-all duration-300"
          >
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              📉 Total Expense
            </h2>
            <p className="text-4xl font-bold">Rs {expense}</p>
            <div className="mt-6">
              <Button
                text="Add Expense"
                onClick={showExpenseModal}
                fullWidth
                blue
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Cards;

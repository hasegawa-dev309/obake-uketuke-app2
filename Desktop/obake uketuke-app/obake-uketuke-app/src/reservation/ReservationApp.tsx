import { useMemo, useState } from "react";
import { ticketsStore } from "../store/tickets";
import ReservationHeader from "../components/ReservationHeader";
import ReservationCard from "../components/ReservationCard";
import FormField from "../components/FormField";
import GradientButton from "../components/GradientButton";

export default function ReservationApp() {
  const [email, setEmail] = useState("");
  const [people, setPeople] = useState("1");
  const [ageGroup, setAgeGroup] = useState("一般");
  
  const disabled = useMemo(() => !email || !/^\S+@\S+\.\S+$/.test(email), [email]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePeopleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeople(e.target.value);
  };

  const handleAgeGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAgeGroup(e.target.value);
  };

  const submit = () => {
    if (disabled) return;
    ticketsStore.add?.({
      email,
      people: Number(people),
      ageGroup: ageGroup as "高校生以下" | "大学生" | "一般"
    });
    // 完了画面へ
    location.href = "/reservation/complete";
  };

  const peopleOptions = Array.from({ length: 10 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1}名`
  }));

  const ageGroupOptions = [
    { value: "高校生以下", label: "高校生以下" },
    { value: "大学生", label: "大学生" },
    { value: "一般", label: "一般" }
  ];

  return (
    <div className="min-h-screen font-sans bg-[linear-gradient(180deg,#fff7f1,#fff)] text-surface-text">
      <ReservationHeader />
      
      <div className="max-w-md mx-auto px-4 py-6">
        <ReservationCard title="整理券取得">
          <FormField
            id="email"
            label="メールアドレス"
            icon="📧"
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="you@example.com"
            required
          />
          
          <FormField
            id="people"
            label="人数"
            icon="👥"
            type="select"
            value={people}
            onChange={handlePeopleChange}
            options={peopleOptions}
          />
          
          <FormField
            id="ageGroup"
            label="年齢層"
            icon="👶"
            type="select"
            value={ageGroup}
            onChange={handleAgeGroupChange}
            options={ageGroupOptions}
            required
          />
          
          <div className="pt-4">
            <GradientButton onClick={submit} disabled={disabled}>
              整理券を発行する
            </GradientButton>
          </div>
        </ReservationCard>
        
        {/* 下部余白 */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}

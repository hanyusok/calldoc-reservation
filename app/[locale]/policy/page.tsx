import { useTranslations } from 'next-intl';

export default function PolicyPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900">환불 및 취소 정책 (Refund Policy)</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        CallDoc 서비스 이용에 대한 취소 및 환불 규정입니다.
                    </p>
                </div>
                <div className="px-4 py-5 sm:p-6 space-y-8">

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">1. 예약 취소 규정</h2>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li>진료 시작 시간 <strong>10분 전</strong>까지 100% 취소 및 환불이 가능합니다.</li>
                            <li>진료 시작 되었거나, 또는 진료 시간 경과 후(No-Show)에는 취소 및 환불이 불가능합니다.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">2. 환불 규정</h2>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li><strong>의료진의 사정</strong>으로 진료가 취소된 경우, 시점과 관계없이 100% 환불됩니다.</li>
                            <li>시스템 장애 등 회사의 귀책사유로 인해 서비스 이용이 불가능했던 경우 100% 환불됩니다.</li>
                            <li>진료가 정상적으로 완료된 이후에는 단순 변심에 의한 환불이 불가능합니다.</li>
                            <li>환불 처리는 카드사 영업일 기준 3~5 일이 소요될 수 있습니다.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">3. 이의 제기 및 문의</h2>
                        <p className="text-gray-600 mb-2">
                            환불 금액이나 처리에 대해 이의가 있으신 경우에는 아래 고객센터로 문의해 주시기 바랍니다.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700">
                            <p><strong>이메일:</strong> hanyusok@calldoc.co.kr</p>
                            <p><strong>전화번호:</strong> 031-657-8279 (평일 10:00 ~ 17:00)</p>
                        </div>
                    </section>

                    <div className="border-t border-gray-200 pt-6 mt-8">
                        <p className="text-xs text-gray-400">
                            * 본 정책은 2024년 1월 1일부터 적용됩니다.<br />
                            * CallDoc은 비대면 진료 중개 플랫폼으로서, 진료의 주체는 제휴 의료기관입니다. 의학적 판단에 대한 책임은 의료진에게 있습니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

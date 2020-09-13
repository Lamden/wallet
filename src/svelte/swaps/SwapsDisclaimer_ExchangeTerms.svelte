<script>
    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';

    //Stores
    import { steps, coinsDropDown, currentNetwork } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button, DropDown, InputBox } = Components;

    //Context
    const { changeStep, setLamdenWallet } = getContext('functions');
    const { switchPage } = getContext('app_functions');

    let notScrolled = true;
    let read_and_confirmed = false;
    let inputElm;

    const legalText = `
LAMDEN TOCKEN EXCHANGE
EXCHANGE TERMS AND CONDITIONS

1.	General	1
2.	Object of the Agreement and Execution	2
3.	Representations and Warranties	2
4.	Applicant rights and obligations	3
5.	User rights in the operation of the Platform	4
6.	Acceptance of risks	4
7.	Liability of Lamden – Restrictions - Compensation	6
8.	Miscellaneous	6

1. General
1.1 Lamden Sàrl (“Lamden”), a limited liability company incorporated under the laws of Switzerland, has issued tokens based on ERC20 technology (“Lamden TAU ERC-20”). After a new platform (“Platform”) has been developed, Lamden Sàrl is now in a position to exchange users’ Lamden TAU ERC-20 for new Lamden Mainnet tokens (“Lamden TAU Mainnet”) that allow access to the Platform.
1.2 The token Exchange (“Exchange”) is provided solely by Lamden Sàrl, rue de Lausanne 37, 1201 Geneva, Switzerland.
1.3 The Exchange is intended only for persons who already hold Lamden TAU ERC-20.
1.4 The Exchange occurs exclusively as follows:
        - Lamden publicly communicates general information on the Exchange process and conditions; in this context, it has invited Lamden TAU ERC-20 holders to make an offer for an Exchange. 
        - A Lamden TAU ERC-20 holder who wishes to make an offer (“Applicant”) has to follow the Exchange process provided by Lamden that is explained on Lamden’s website. For legal reasons, the Applicant will be asked some personal questions. If the answers are appropriate, the Applicant will have access to the details that allow him to send his tokens for Exchange.
        - When an Applicant sends his Lamden TAU ERC-20 for Exchange, he is considered making an offer (“Offer”) to Lamden in accordance with article 6 of the Swiss Code of obligations. This Offer will be binding on the Applicant. Offers can only be sent under certain conditions, in particular acceptance of the present Terms and Conditions (“Terms”). Therefore, these Terms will be applicable to all Exchanges.
        - The Offer is accepted by Lamden, and therefore the Exchange Agreement (“Agreement”) is concluded, through fulfilment by delivery of Lamden TAU Mainnet to the Applicant by Lamden.
        - The Offer is rejected by Lamden if the Applicant receives his Lamden TAU ERC-20 back in his wallet. In such case, the Agreement is not concluded.
        - The Applicant will not receive any notice of rejection or receipt of exchange from Lamden.
        - The Exchange is irrevocable.

2. Object of the Agreement and Execution
2.1 Tokens that can be submitted for Exchange are only Lamden TAU ERC-20 delivered by Lamden and  based on ERC-20 technology.
2.2 Tokens that are delivered by Lamden following the Exchange (Lamden TAU Mainnet) are based on Lamden’s own Mainnet technology. They are pure utility tokens. The Lamden TAU Mainnet are not intended to be a digital currency, security, commodity or any other kind of financial instrument and Lamden does not, in any way, invite persons to subscribe to any securities.
2.3 The Exchange rate is 1-to-1. This means that, if the Exchange is accepted and the Agreement concluded, the Applicant receives a number of Lamden TAU Mainnet equal to the number of Lamden TAU ERC-20 he has sent for the Exchange.
2.4 Lamden may accept or reject an Applicant’s offer on its sole discretion in the event it considers that the present Terms are not met or for any technical reason.
2.5 The Exchange is executed by a smart contract. 
2.6 The account used for the Exchange will be credited with the appropriate number of Lamden TAU Mainnet. All deliveries will be made electronically. Deliveries will be made directly to the Applicant’s account, address or wallet associated with the Exchange. The wallet must possess technical infrastructure that is compatible with the receipt, storage and transfer of Lamden TAU Mainnet.

3. Representations and Warranties
3.1 The Applicant, when making an Offer, represents and warrants the following:
        - The Applicant is familiar with blockchain and tokens technologies and understands the risks associated therewith. The Applicant understands in particular that Lamden TAU Mainnet give access to a Platform that is hosted by a community of users, so that Lamden is not in a position to warrant the functioning of the Platform. The Applicant has obtained sufficient information about the Platform to make an informed decision to enter into the Agreement.
        - The Applicant is the rightful owner of the Lamden TAU ERC-20 that he is sending for Exchange. He is acting solely on his own behalf and is exchanging Lamden TAU ERC-20 for personal use and utility, to participate on the Platform, and not for investment, for distribution or for financial purposes.
        - The Applicant has full capacity, under the law of his country of residence (and under the law of his country of origin, if applicable) to commit himself and to enter into the Agreement.
        - If the Applicant is a company or another non-natural person, the person acting on behalf of such company is authorized to accept the present Terms on such entity's behalf and to commit the company according to these Terms.
        - The present Terms will not result in any breach of, be in conflict with any provision of such entity’s constitutional or organizational documents, any provision of any judgment, decree or order imposed on such entity or any other obligation, duty or commitment to which such entity is a party or by which such entity is bound.
        - The Exchange and the holding of Lamden TAU Mainnet comply with the law of the Applicant’s country of residence and with all applicable law.
        - The Applicant is not domiciled and/or physically present in Switzerland or Liechtenstein from the time he sends his Offer until he receives Lamden TAU Mainnet in Exchange.
        - The Applicant is not domiciled in a jurisdiction where participating in the Exchange is not permitted or is subject to specific registration or licensing requirements.
        - The Applicant is not domiciled in a jurisdiction subject to international sanctions and is not physically present in such jurisdiction from the time he sends his Offer until he receives Lamden TAU Mainnet in Exchange.
        - The Applicant is aware that Lamden TAU Mainnet do not represent any ownership right or stake, share, equity, security, collective investment scheme, financial derivative, futures contract, deposit, commercial paper, negotiable instrument, investment contract, note, commodity, bond, warrant, certificate debt or any other financial instrument or investment entitling the holder to interest, dividends or any equivalent rights.
        - The Applicant is aware that Lamden TAU Mainnet do not represent any form of currency or money.

4. Applicant rights and obligations
4.1 When making an Offer, the Applicant only has the right:
    - to receive a number of Lamden TAU Mainnet equal to the number of Lamden TAU ERC-20 that he has sent if the Exchange is accepted by Lamden;
    or
    - to receive his Lamden TAU ERC-20 back if the Exchange is rejected by Lamden.
4.2 If the Exchange, or the holding of Lamden TAU Mainnet by the Applicant, is or becomes impossible or a violates any applicable laws or regulations, then:
    - Lamden may request that steps be taken to ensure the full return of any Lamden TAU Mainnet hold by the Applicant;
    - Lamden reserves the right to take any action considered necessary or desirable for Lamden to meet its legal and regulatory obligations.
4.3 Lamden shall not be liable for specific performance under this Agreement in the event Section 4.2 above applies. 
4.4 The Lamden TAU Mainnet only allow the holders to access the Platform and use Lamden’s technology, as available. Holding Lamden TAU Mainnet does not confer any other right, express or implied, to the holder or to any third party.
4.5 A conversion of Lamden TAU Mainnet into any other kind of tokens or fiat money is explicitly excluded, as well as any kind of refund. A general conversion of all Lamden TAU Mainnet to new future tokens for operational or technical reasons is reserved.
4.6 In particular and for example, the Applicant does not have:
        - any kind of participation right in Lamden or in any affiliated company,
        - any claim against Lamden or any affiliated company,
        - any intellectual property right on goods or services,
        - any expectation for future incomes.
4.7 Applicants are not entitled to request a reverse exchange of their Lamden TAU Mainnet once the Exchange has been completed. Such a reverse exchange is not possible as the Lamden TAU ERC-20 are irrevocably cancelled after completion of the Exchange.
4.8 At any time, the Applicant shall provide to Lamden, or to Lamden’s representative, immediately upon request, personal information that Lamden, in its sole discretion, deems to be required for compliance with any applicable law, regulation or policy. Such information may include, without limitation, a passport or government identification card, and Lamden or its representative may keep a copy of such information for records.

5. User rights in the operation of the Platform
5.1 Each Lamden Token gives its holder (“Holder”) the ability to cast a vote through 'lodging' the token in official protocol voting contracts.
5.2 A Holder has the ability to elect new individuals to the network to process the transactions.
5.3 Once an individual is voted into the network as a service provider, he is able to vote on key network policy. Each individual who helps run the network gets an equal vote to each other.
5.4 Network providers get to start and vote in elections that affect the following parameters:
        - The cost of a stamp, the smallest unit of a transaction fee,
        - Distribution of rewards to the five rewarded parties (masternodes, delegates, smart contract developers, foundation, burn),
        - Electing a new seat, which means adding a new service provider position to help process the network,
        - Terminating agreements entered into with service providers who have acted in bad faith,
         -Whether or not to accept a proposed upgrade that has been submitted by the community (new upgrades may add, modify, or remove certain features that affect the voting options of the protocol).

6. Acceptance of risks
6.1	Blockchain technology is still recent and therefore involves risks, in particular due to technological issues, which may then adversely impact on the use of the Lamden TAU Mainnet. The Applicant is aware of and agrees to assume all the risks related to the Exchange, and to holding and using Lamden TAU Mainnet, including the following:
6.1.1 Risk of loss of tokens. Lamden TAU Mainnet can be used and controlled exclusively with a private key or a combination of private keys. Therefore losing one’s private key(s) related to Lamden TAU Mainnet also means losing the related tokens. Giving access to a third party to one’s private key(s) also means giving full access to the related tokens. The Applicant is responsible for implementing reasonable measures for securing his wallet and preventing any third party from gaining access to it.
6.1.2 Risk of hacking and lack of security. The Platform and the Applicant may be exposed to attacks by hackers or other individuals or organizations that interfere with the Platform or the availability of the tokens in many ways, including new methods that may not be known at this time. Any such successful attack could result in theft or loss of Lamden TAU Mainnet and adverse impact on the ability to further develop the Platform.
6.1.3 Risk of Platform malfunction. Lamden Mainnet is a Platform set up and developed by Lamden but which is hosted by a community of members. Therefore, there is a risk of malfunction and future evolution of the Platform that could be damaging for the Applicant but such a risk is beyond Lamden’s control.
6.1.4 Risk related to the usability of tokens. Lamden TAU Mainnet are utility tokens and, therefore, their value is only related to the services provided by third parties that can be accessed with the Lamden TAU Mainnet. Lamden makes no (and disclaims all) warranties or representations (whether express or implied) that Lamden TAU Mainnet will confer any actual and/or exercisable rights of use, functionality, features, purpose or attributes in connection with the Platform in the future.
6.1.5 Risk related to unsuccessful development of the Platform. Even if all or parts of the Platform are successfully developed and released, the Platform could be fully or partially abandoned or shut down for lack of public interest or if it remains commercially unsuccessful. In addition, Lamden may not be able to fund development, or may not be able to develop or maintain the Platform as intended.
6.1.6 Risk related to regulation. Since blockchain technology is recent, it is not specifically regulated in most countries. It is likely that new regulations will be adopted in the future in many countries or that existing regulations will be adapted. Depending on the content of such regulations, Lamden may have to cease, or cause third parties to cease, the development and usability of the Platform in some countries.
6.1.7 Tax risk. Acquiring, holding, using and disposing of tokens can have significative tax consequences for an Applicant or Holder, wo shall be fully responsible for complying with any tax laws applicable in this context. 
6.1.8 Risk related to the experimental nature of tokens. As tokens are a new technology of which there is little experience, there are risks that Lamden cannot anticipate. Further risks may materialize as unanticipated combinations or variations of the discussed risks or the emergence of new risks.

7. Liability of Lamden – Restrictions - Compensation
7.1 The Lamden TAU Mainnet are provided “as is”, without any kind of warranty from Lamden or any affiliated company. In particular, Lamden does not represent or warrant that the Lamden TAU Mainnet:
        - meet your requirements,
        - are appropriate for any specific purpose,
        - will be usable for any purpose in the short, medium or long term,
        - are free of any error or can be corrected if needed,
        - are free of viruses or any other harmful component.
7.2 To the fullest extent permitted by law, any liability of Lamden is excluded.
7.3 Under no circumstances will Lamden be liable for any damage, including lost profits or business interruption, of any kind whether in an action in contract or negligence arising out of, or in any way related to, the use or inability to use Lamden TAU Mainnet and the Platform, or in connection with any failure of performance, error, omission, interruption, defect, delay in operation or transmission, computer virus or line or system failure.
7.4 Lamden’s liability is also excluded if the Exchange or the subsequent use of Lamden TAU Mainnet results in the need to maintain, repair or correct the Applicant’s equipment or data.
7.5 The only remedy for dissatisfaction with Lamden TAU Mainnet is to stop using them.
7.6 To the fullest extent permitted by law, the Applicant or Holder will indemnify, defend and hold harmless Lamden and its affiliated companies, and their respective past, present and future employees, officers, directors, managers, service providers, agents and representatives, on demand from and against all claims, demands, actions, damages, losses, costs and expenses (including attorneys' fees, court costs, investigative costs, amounts paid in settlement and other costs and expenses) that arise from or relate to the Applicant’s or Holder’s violation of the present Terms.

8. Miscellaneous
8.1 No variation or modification of the Agreement shall be of any force or effect unless the same has been confirmed in writing.
8.2 This Agreement constitutes the whole and entire agreement between Lamden and the Applicant with regard to the subject matter hereof and there have not been and there are no agreements, representations or warranties between the parties other than those specifically set forth herein.
8.3 No waiver or abandonment by Lamden of any of its rights in terms of the Agreement, shall be binding, unless such waiver of abandonment is in writing.
8.4 The Applicant may not assign or transfer any of his rights or obligations under the Agreement. This clause does not affect the Lamden TAU Mainnet themselves.
8.5 Should any provision of the Agreement be or become void, illegal or unenforceable, then the validity of all the other provisions shall not be affected thereby.
8.6 The Agreement and any dispute or claim arising out of, or in connection with, it or its subject matter will be governed by and construed in accordance with the substantive laws of Switzerland (not taking into consideration international private law rules).
8.7 Any dispute arising hereunder shall be submitted to the exclusive jurisdiction of the competent courts in Geneva, Switzerland.

Lamden Sàrl / Geneva
`

    const nextPage = () => changeStep(3)

    const handleScroll = (e) => {
        if (inputElm.scrollHeight - inputElm.scrollTop === inputElm.clientHeight) notScrolled = false
    }

    
</script>

<style>
h3{
    margin: 0 0 1rem;
}
.flow-content-right{
    max-width: 80%;
    align-items: flex-start;
    
}
.accepted{
    color: var(--font-success)
}
.not-accepted{
    color: var(--font-warning)
}
.chk-checkmark{
    top: -3px;
}
.chk-container{
    font-size: 15px;
}
</style>

<div id="swap_exchangeTerms" class="flex-row flow-page" in:fade="{{delay: 0, duration: 200}}">
    <div class="flex-column flow-content-left">
        <h6>Exchange Terms and Conditions</h6>
    
        <p class="flow-text-box text-body1 text-primary">
            Please read and <strong class="text-cyan">scroll text all the way to the bottom</strong>, check the box to accept terms and click the button to proceed.
        </p>

        <div class="flex-column flow-buttons">
            <Button id={'proceed-btn'}
                    classes={'button__solid button__purple'}
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name={"Proceed"}
                    disabled={!read_and_confirmed}
                    click={nextPage} />
            <Button id={'back-btn'}
                    classes={'button__solid'} 
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name="Cancel" 
                    click={() => switchPage('Swaps')} />  
         </div>
    </div>
    <div class="flex-column flow-content-right" in:fade="{{delay: 0, duration: 200}}">
        <h3>Exchange terms and conditions</h3> 
        <InputBox 
            id="exchange_terms"
            inputType="textarea"
            bind:thisInput={inputElm}
            value={legalText}
            margin="-1rem 0 2rem"
            rows="19"
            on:scroll={handleScroll}
            readonly={true}
        />
        <div class="checkbox-box">
            <label  class="chk-container" 
                    id="accept-terms-chk" 
                    class:text-primary-dark={notScrolled} 
                    class:not-accepted={!read_and_confirmed && !notScrolled} 
                    class:accepted={read_and_confirmed && !notScrolled}>
                <input  type="checkbox" bind:checked={read_and_confirmed} disabled={notScrolled}>
                <span class="chk-checkmark"></span>
                I accept Exchange Terms and Conditions and am willing to proceed and make an exchange offer
            </label>
        </div>
    </div>
</div>


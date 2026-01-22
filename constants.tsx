import { Ingredient, Recipe } from './types';

// --- IMPORTAÇÃO DAS IMAGENS DOS INGREDIENTES ---
import imgAgua from './assets/ingredientes/Agua.png';
import imgAlho from './assets/ingredientes/Alho.png';
import imgAmendoim from './assets/ingredientes/Amendoim.png';
import imgArroz from './assets/ingredientes/Arroz.png';
import imgAzeiteDeDende from './assets/ingredientes/AzeiteDeDende.png';
import imgAcucar from './assets/ingredientes/Açucar.png'; // Verifique se o arquivo tem cedilha mesmo
import imgBatata from './assets/ingredientes/Batata.png';
import imgCamarao from './assets/ingredientes/Camarão.png'; // Verifique o til
import imgCapote from './assets/ingredientes/Capote.png';
import imgCarne from './assets/ingredientes/Carne.png';
import imgCarneDeSol from './assets/ingredientes/CarneDeSol.png';
import imgCebola from './assets/ingredientes/Cebola.png';
import imgCoco from './assets/ingredientes/Coco.png';
import imgCuscuz from './assets/ingredientes/Cuscuz.png';
import imgFarinha from './assets/ingredientes/Farinha.png';
import imgFeijao from './assets/ingredientes/Feijão.png'; // Verifique o til
import imgFrutasSecas from './assets/ingredientes/FrutasSecas.png';
import imgGoiabada from './assets/ingredientes/Goiabada.png';
import imgGoma from './assets/ingredientes/Goma.png';
import imgLeite from './assets/ingredientes/Leite.png';
import imgLeiteCondensado from './assets/ingredientes/LeiteCondensado.png';
import imgLeiteDeCoco from './assets/ingredientes/LeiteDeCoco.png';
import imgManteiga from './assets/ingredientes/Manteiga.png';
import imgManteigaEngarrafada from './assets/ingredientes/ManteigaEngarrafada.png';
import imgMassaBase from './assets/ingredientes/MassaBase.png';
import imgMilho from './assets/ingredientes/Milho.png';
import imgOvos from './assets/ingredientes/Ovos.png';
import imgPeixe from './assets/ingredientes/Peixe.png';
import imgPimentao from './assets/ingredientes/Pimentao.png';
import imgQueijoCoalho from './assets/ingredientes/QueijoCoalho.png';
import imgSal from './assets/ingredientes/Sal.png';
import imgSiri from './assets/ingredientes/Siri.png';
import imgTomate from './assets/ingredientes/Tomate.png';
import imgUmbu from './assets/ingredientes/Umbu.png';
import imgVatapa from './assets/ingredientes/Vatapa.png';
import imgVinagrete from './assets/ingredientes/Vinagrete.png';
import imgVinho from './assets/ingredientes/Vinho.png';

// --- IMPORTAÇÃO DAS IMAGENS DAS RECEITAS ---
import imgAcaraje from './assets/receitas/Acaraje.png';
import imgAmendoinCozido from './assets/receitas/AmendoinCozido.png'; // Atenção: Amendoin com N
import imgArrozAoLeite from './assets/receitas/ArrozAoLeite.png';
import imgArrozDeCuxa from './assets/receitas/ArrozDeCuxa.png';
import imgBaiaoDeDois from './assets/receitas/BaiaoDeDois.png';
import imgBalaBaiana from './assets/receitas/BalaBaiana.png';
import imgBoliviano from './assets/receitas/Boliviano.png';
import imgBoloCasete from './assets/receitas/BoloCasete.png';
import imgBoloDeNoiva from './assets/receitas/BoloDeNoiva.png';
import imgBoloDeRolo from './assets/receitas/BoloDeRolo.png';
import imgBoloLiso from './assets/receitas/BoloLiso.png';
import imgBruaca from './assets/receitas/Bruaca.png';
import imgCanjica from './assets/receitas/Canjica.png';
import imgCapoteAoMolho from './assets/receitas/CapoteAoMolho.png';
import imgCocada from './assets/receitas/Cocada.png';
import imgCuscuzComOvo from './assets/receitas/CuscuzComOvo.png';
import imgCuscuzPotiguar from './assets/receitas/CuscuzPotiguar.png';
import imgDadinho from './assets/receitas/Dadinho.png';
import imgFeijaoDeCoco from './assets/receitas/FeijaoDeCoco.png';
import imgFritadaDeSiri from './assets/receitas/FritadaDeSiri.png';
import imgGingaComTapioca from './assets/receitas/GingaComTapioca.png';
import imgManue from './assets/receitas/Manue.png';
import imgMariaIsabel from './assets/receitas/MariaIsabel.png';
import imgMilhoCozido from './assets/receitas/MilhoCozido.png';
import imgMoqueca from './assets/receitas/Moqueca.png';
import imgMunguzaDoce from './assets/receitas/MunguzaDoce.png';
import imgPacocaDeCarneDeSol from './assets/receitas/PacocaDeCarneDeSol.png';
import imgPamonha from './assets/receitas/Pamonha.png';
import imgPanelada from './assets/receitas/Panelada.png';
import imgPastelDoce from './assets/receitas/PastelDoce.png';
import imgPeixadaAlagoana from './assets/receitas/PeixadaAlagoana.png';
import imgQueijadinha from './assets/receitas/Queijadinha.png';
import imgRubacao from './assets/receitas/Rubacao.png';
import imgTapiocaRecheada from './assets/receitas/TapiocaRecheada.png';
import imgTortaDeCamaraoMaranhense from './assets/receitas/TortaDeCamaraoMaranhense.png';
import imgUmbuzada from './assets/receitas/Umbuzada.png';


export const INGREDIENTS: Ingredient[] = [
  { name: 'Cebola', code: 'I-1-0-1', score: 1, image: imgCebola },
  { name: 'Leite', code: 'I-1-0-2', score: 1, image: imgLeite },
  { name: 'Ovos', code: 'I-1-0-3', score: 1, image: imgOvos },
  { name: 'Alho', code: 'I-1-0-4', score: 1, image: imgAlho },
  { name: 'Açúcar', code: 'I-2-0-5', score: 2, image: imgAcucar },
  { name: 'Manteiga', code: 'I-2-0-6', score: 2, image: imgManteiga },
  { name: 'Queijo Coalho', code: 'I-2-0-7', score: 2, image: imgQueijoCoalho },
  { name: 'Pimentão', code: 'I-3-0-8', score: 3, image: imgPimentao },
  { name: 'Coco', code: 'I-3-0-9', score: 3, image: imgCoco },
  { name: 'Carne de Sol', code: 'I-3-0-10', score: 3, image: imgCarneDeSol },
  { name: 'Tomate', code: 'I-3-0-11', score: 3, image: imgTomate },
  { name: 'Milho', code: 'I-3-0-12', score: 3, image: imgMilho },
  { name: 'Arroz', code: 'I-3-0-13', score: 3, image: imgArroz },
  { name: 'Leite Condensado', code: 'I-3-0-14', score: 3, image: imgLeiteCondensado },
  { name: 'Carne', code: 'I-3-0-15', score: 3, image: imgCarne },
  { name: 'Farinha', code: 'I-3-0-16', score: 3, image: imgFarinha },
  { name: 'Água', code: 'I-3-0-17', score: 3, image: imgAgua },
  { name: 'Feijão', code: 'I-3-0-18', score: 3, image: imgFeijao },
  { name: 'Sal', code: 'I-3-0-19', score: 3, image: imgSal },
  { name: 'Goma', code: 'I-3-0-20', score: 3, image: imgGoma },
  { name: 'Leite de Coco', code: 'I-3-0-21', score: 3, image: imgLeiteDeCoco },
  { name: 'Massa Base', code: 'I-4-0-22', score: 4, image: imgMassaBase },
  { name: 'Azeite de Dendê', code: 'I-4-0-23', score: 4, image: imgAzeiteDeDende },
  { name: 'Camarão', code: 'I-4-0-24', score: 4, image: imgCamarao },
  { name: 'Peixe', code: 'I-4-0-25', score: 4, image: imgPeixe },
  { name: 'Batata', code: 'I-4-0-26', score: 4, image: imgBatata },
  { name: 'Cuscuz', code: 'I-4-0-27', score: 4, image: imgCuscuz },
  { name: 'Amendoim', code: 'I-4-0-28', score: 4, image: imgAmendoim },
  { name: 'Manteiga de Garrafa', code: 'I-4-0-29', score: 4, image: imgManteigaEngarrafada },
  { name: 'Capote', code: 'I-4-0-30', score: 4, image: imgCapote },
  { name: 'Vatapá', code: 'I-4-0-31', score: 4, image: imgVatapa },
  { name: 'Vinho', code: 'I-4-0-32', score: 4, image: imgVinho },
  { name: 'Frutas Secas', code: 'I-4-0-33', score: 4, image: imgFrutasSecas },
  { name: 'Goiabada', code: 'I-4-0-34', score: 4, image: imgGoiabada },
  { name: 'Vinagrete', code: 'I-4-0-35', score: 4, image: imgVinagrete },
  { name: 'Siri', code: 'I-4-0-36', score: 4, image: imgSiri },
  { name: 'Umbu', code: 'I-4-0-37', score: 4, image: imgUmbu },
];

export const RECIPES: Recipe[] = [
  { name: 'Fritada de Siri', code: 'R-9-AL-1', value: 9, state: 'AL', ingredients: ['Siri', 'Ovos', 'Leite de Coco', 'Cebola'], instructions: 'Refogue a cebola, adicione o siri e leite de coco. Cubra com ovos batidos e asse/frite até dourar.', image: imgFritadaDeSiri },
  { name: 'Cocada da Massagueira', code: 'R-6-AL-2', value: 6, state: 'AL', ingredients: ['Açúcar', 'Coco', 'Leite'], instructions: 'Cozinhe açúcar e leite até formar calda; adicione coco e mexa até desgrudar do fundo.', image: imgCocada },
  { name: 'Peixada Alagoana', code: 'R-19-AL-3', value: 19, state: 'AL', ingredients: ['Peixe', 'Batata', 'Cebola', 'Leite de Coco', 'Alho', 'Pimentão', 'Tomate'], instructions: 'Camadas de vegetais e peixe temperado, regadas com leite de coco e cozidas no vapor.', image: imgPeixadaAlagoana },
  { name: 'Acarajé', code: 'R-19-BA-4', value: 19, state: 'BA', ingredients: ['Feijão', 'Camarão', 'Azeite de Dendê', 'Vatapá', 'Vinagrete'], instructions: 'Massa de feijão frita no dendê, recheada com vatapá, camarão e vinagrete.', image: imgAcaraje },
  { name: 'Bala Baiana', code: 'R-8-BA-5', value: 8, state: 'BA', ingredients: ['Leite Condensado', 'Coco', 'Açúcar'], instructions: 'Brigadeiro de coco enrolado e banhado em calda de açúcar em ponto de vidro.', image: imgBalaBaiana },
  { name: 'Boliviano', code: 'R-9-BA-6', value: 9, state: 'BA', ingredients: ['Carne', 'Farinha', 'Ovos', 'Açúcar'], instructions: 'Massa cozida recheada com carne moída, frita e passada no açúcar.', image: imgBoliviano },
  { name: 'Baião de Dois', code: 'R-10-CE-7', value: 10, state: 'CE', ingredients: ['Arroz', 'Feijão', 'Queijo Coalho', 'Alho', 'Cebola'], instructions: 'Arroz e feijão cozidos juntos com refogado e finalizados com cubos de queijo coalho.', image: imgBaiaoDeDois },
  { name: 'Bolo Liso', code: 'R-7-CE-8', value: 7, state: 'CE', ingredients: ['Leite', 'Farinha', 'Manteiga', 'Ovos'], instructions: 'Massa líquida sem fermento, assada até ganhar textura de pudim firme.', image: imgBoloLiso },
  { name: 'Panelada', code: 'R-5-CE-9', value: 5, state: 'CE', ingredients: ['Carne', 'Alho', 'Cebola'], instructions: 'Bucho e tripas limpos, cozidos na pressão com temperos até ficarem macios e o caldo engrossar.', image: imgPanelada },
  { name: 'Arroz de Cuxá', code: 'R-15-MA-10', value: 15, state: 'MA', ingredients: ['Arroz', 'Camarão', 'Alho', 'Cebola', 'Pimentão', 'Tomate'], instructions: 'Arroz cozido com camarão seco e refogado de vegetais para absorver o sabor do mar.', image: imgArrozDeCuxa },
  { name: 'Bolo Casete', code: 'R-5-MA-11', value: 5, state: 'MA', ingredients: ['Goma', 'Leite', 'Ovos'], instructions: 'Massa de goma escaldada, modelada e assada até ficar crocante por fora e macia por dentro.', image: imgBoloCasete },
  { name: 'Torta de Camarão Maranhense', code: 'R-13-MA-12', value: 13, state: 'MA', ingredients: ['Camarão', 'Batata', 'Ovos', 'Cebola', 'Pimentão'], instructions: 'Purê de batata misturado com refogado de camarão, coberto com ovos em neve e gratinado.', image: imgTortaDeCamaraoMaranhense },
  { name: 'Mungunzá Doce', code: 'R-7-PB-13', value: 7, state: 'PB', ingredients: ['Milho', 'Leite', 'Leite Condensado'], instructions: 'Milho branco cozido na pressão, finalizado com leites até ficar cremoso.', image: imgMunguzaDoce },
  { name: 'Pastelzinho de Carne com Açúcar', code: 'R-9-PB-14', value: 9, state: 'PB', ingredients: ['Massa Base', 'Carne', 'Açúcar'], instructions: 'Pastel de carne frito e imediatamente passado no açúcar.', image: imgPastelDoce },
  { name: 'Rubação', code: 'R-20-PB-15', value: 20, state: 'PB', ingredients: ['Arroz', 'Feijão', 'Carne de Sol', 'Queijo Coalho', 'Leite', 'Vegetais'], instructions: 'Baião cremoso com leite, carne de sol frita e muito queijo coalho derretido.', image: imgRubacao },
  { name: 'Bolo de Noiva', code: 'R-17-PE-16', value: 17, state: 'PE', ingredients: ['Massa Base', 'Frutas Secas', 'Vinho', 'Manteiga', 'Açúcar', 'Ovos'], instructions: 'Bolo denso e escuro com frutas maceradas no vinho e especiarias.', image: imgBoloDeNoiva },
  { name: 'Bolo de Rolo', code: 'R-8-PE-17', value: 8, state: 'PE', ingredients: ['Massa Base', 'Goiabada'], instructions: 'Camadas finíssimas de massa assadas rapidamente e enroladas com goiabada derretida.', image: imgBoloDeRolo },
  { name: 'Feijão de Coco', code: 'R-8-PE-18', value: 8, state: 'PE', ingredients: ['Feijão', 'Leite de Coco', 'Alho', 'Cebola'], instructions: 'Feijão cozido e apurado com refogado e leite de coco até ficar cremoso.', image: imgFeijaoDeCoco },
  { name: 'Capote ao Molho', code: 'R-16-PI-19', value: 16, state: 'PI', ingredients: ['Capote', 'Azeite de Dendê', 'Alho', 'Cebola', 'Tomate', 'Pimentão'], instructions: 'Galinha-d\'angola cozida lentamente com vegetais e um toque de dendê.', image: imgCapoteAoMolho },
  { name: 'Maria Isabel', code: 'R-8-PI-20', value: 8, state: 'PI', ingredients: ['Arroz', 'Carne de Sol', 'Alho', 'Cebola'], instructions: 'Carne de sol frita e arroz cozido na mesma panela para pegar a cor e o sabor.', image: imgMariaIsabel },
  { name: 'Paçoca de Carne de Sol no Pilão', code: 'R-12-PI-21', value: 12, state: 'PI', ingredients: ['Carne de Sol', 'Farinha', 'Manteiga de Garrafa', 'Alho', 'Cebola'], instructions: 'Carne frita na manteiga e batida no pilão com farinha.', image: imgPacocaDeCarneDeSol },
  { name: 'Bruaca', code: 'R-12-GE-22', value: 12, state: 'GE', ingredients: ['Farinha', 'Leite', 'Açúcar', 'Ovos', 'Manteiga', 'Sal'], instructions: 'Massa de panqueca grossa dourada na frigideira untada.', image: imgBruaca },
  { name: 'Canjica', code: 'R-11-GE-23', value: 11, state: 'GE', ingredients: ['Milho', 'Leite', 'Açúcar', 'Manteiga', 'Água'], instructions: 'Suco de milho verde cozido com leite e açúcar até virar um creme firme.', image: imgCanjica },
  { name: 'Cuscuz com Ovo', code: 'R-7-GE-24', value: 7, state: 'GE', ingredients: ['Cuscuz', 'Ovos', 'Manteiga'], instructions: 'Cuscuz no vapor servido com ovos fritos na manteiga por cima.', image: imgCuscuzComOvo },
  { name: 'Dadinho de Tapioca', code: 'R-6-GE-25', value: 6, state: 'GE', ingredients: ['Goma', 'Queijo Coalho', 'Leite'], instructions: 'Mistura de tapioca granulada e queijo coalho hidratada com leite quente, resfriada e frita.', image: imgDadinho },
  { name: 'Milho Cozido', code: 'R-9-GE-26', value: 9, state: 'GE', ingredients: ['Milho', 'Água', 'Sal'], instructions: 'Espigas de milho cozidas em água salgada até ficarem macias.', image: imgMilhoCozido },
  { name: 'Pamonha', code: 'R-13-GE-27', value: 13, state: 'GE', ingredients: ['Milho', 'Açúcar', 'Manteiga', 'Sal', 'Água'], instructions: 'Massa de milho temperada, cozida dentro da própria palha em água fervente.', image: imgPamonha },
  
  // A Tapioca antiga foi atualizada com a imagem
  { name: 'Tapioca Recheada', code: 'R-8-GE-36', value: 8, state: 'GE', ingredients: ['Goma', 'Carne de Sol','Queijo Coalho'], instructions: 'Disco de goma hidratada recheado com ingredientes típicos à escolha.', image: imgTapiocaRecheada },
  
  { name: 'Umbuzada', code: 'R-8-GE-28', value: 8, state: 'GE', ingredients: ['Umbu', 'Leite', 'Leite Condensado'], instructions: 'Polpa de umbu cozida e batida com leites para um resultado agridoce e encorpado.', image: imgUmbuzada },
  { name: 'Moqueca', code: 'R-19-GE-29', value: 19, state: 'GE', ingredients: ['Peixe', 'Leite de Coco', 'Azeite de Dendê', 'Vegetais'], instructions: 'Peixe cozido em panela de barro com camadas de vegetais, dendê e leite de coco.', image: imgMoqueca },
  { name: 'Arroz de Leite (Salgado)', code: 'R-6-RN-30', value: 6, state: 'RN', ingredients: ['Arroz', 'Leite', 'Queijo Coalho'], instructions: 'Arroz finalizado com leite para dar cremosidade e cubos de queijo coalho.', image: imgArrozAoLeite },
  { name: 'Cuscuz Potiguar', code: 'R-9-RN-31', value: 9, state: 'RN', ingredients: ['Cuscuz', 'Carne de Sol', 'Queijo Coalho'], instructions: 'Cuscuz misturado com carne de sol crocante e cubos de queijo.', image: imgCuscuzPotiguar },
  { name: 'Ginga com Tapioca', code: 'R-10-RN-32', value: 10, state: 'RN', ingredients: ['Peixe', 'Goma', 'Coco'], instructions: 'Peixinhos fritos inteiros servidos dentro de uma tapioca com coco.', image: imgGingaComTapioca },
  { name: 'Amendoim Cozido', code: 'R-10-SE-33', value: 10, state: 'SE', ingredients: ['Amendoim', 'Água', 'Sal'], instructions: 'Amendoim na casca cozido na pressão com sal.', image: imgAmendoinCozido },
  { name: 'Manuê (Bolo de Milho)', code: 'R-12-SE-34', value: 12, state: 'SE', ingredients: ['Milho', 'Coco', 'Leite', 'Manteiga', 'Açúcar', 'Ovos'], instructions: 'Bolo de milho batido com coco ralado, textura entre bolo e pamonha.', image: imgManue },
  { name: 'Queijadinha', code: 'R-9-SE-35', value: 9, state: 'SE', ingredients: ['Queijo Coalho', 'Coco', 'Leite Condensado', 'Ovos'], instructions: 'Doce de coco e queijo coalho assado até dourar.', image: imgQueijadinha },
];

export const STATES_MAP: Record<string, string> = {
  AL: 'Alagoas',
  PI: 'Piauí',
  BA: 'Bahia',
  CE: 'Ceará',
  MA: 'Maranhão',
  PB: 'Paraíba',
  PE: 'Pernambuco',
  RN: 'Rio Grande do Norte',
  SE: 'Sergipe',
  GE: 'Geral',
};

export const SESSION_CODE = "TAB-0-0-0";

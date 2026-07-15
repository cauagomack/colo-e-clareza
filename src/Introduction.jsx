import './Introduction.css'

export default function Introduction() {
  return (
    <section className="introducao">
      <p className="introducao__linha introducao__linha--titulo">
        Muitas mães estão fazendo o seu melhor...
      </p>
      <p className="introducao__linha introducao__linha--italico">
        mas se sentem cansadas, confusas
        <br />
        e sem saber mais como agir.
      </p>

      <div className="introducao__divisoria" role="presentation" />

      <p className="introducao__linha introducao__linha--afirmacao">
        Aqui, você não será julgada.
      </p>
      <p className="introducao__linha introducao__linha--afirmacao introducao__linha--destaque">
        Você será ajudada a enxergar.
      </p>
    </section>
  )
}
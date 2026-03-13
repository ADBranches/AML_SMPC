use halo2_proofs::{
    circuit::{Layouter, SimpleFloorPlanner, Value},
    pasta::Fp,
    plonk::{Advice, Circuit, Column, ConstraintSystem, Error, Instance},
    poly::Rotation,
};

#[derive(Clone, Debug)]
pub struct Rec11Config {
    pub advice: Column<Advice>,
    pub instance: Column<Instance>,
}

#[derive(Default, Clone, Debug)]
pub struct Rec11Circuit {
    pub record_integrity: Value<Fp>,
}

impl Circuit<Fp> for Rec11Circuit {
    type Config = Rec11Config;
    type FloorPlanner = SimpleFloorPlanner;

    fn without_witnesses(&self) -> Self {
        Self {
            record_integrity: Value::unknown(),
        }
    }

    fn configure(meta: &mut ConstraintSystem<Fp>) -> Self::Config {
        let advice = meta.advice_column();
        let instance = meta.instance_column();

        meta.enable_equality(advice);
        meta.enable_equality(instance);

        meta.create_gate("rec11 record_integrity equals public instance", |meta| {
            let a = meta.query_advice(advice, Rotation::cur());
            let i = meta.query_instance(instance, Rotation::cur());
            vec![a - i]
        });

        Rec11Config { advice, instance }
    }

    fn synthesize(
        &self,
        config: Self::Config,
        mut layouter: impl Layouter<Fp>,
    ) -> Result<(), Error> {
        layouter.assign_region(
            || "rec11 region",
            |mut region| {
                region.assign_advice(
                    || "rec11 record_integrity",
                    config.advice,
                    0,
                    || self.record_integrity,
                )?;
                Ok(())
            },
        )?;

        Ok(())
    }
}
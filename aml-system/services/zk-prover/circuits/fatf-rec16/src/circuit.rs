use halo2_proofs::{
    circuit::{Layouter, SimpleFloorPlanner, Value},
    pasta::Fp,
    plonk::{Advice, Circuit, Column, ConstraintSystem, Error, Instance},
    poly::Rotation,
};

#[derive(Clone, Debug)]
pub struct Rec16Config {
    pub advice: Column<Advice>,
    pub instance: Column<Instance>,
}

#[derive(Default, Clone, Debug)]
pub struct Rec16Circuit {
    pub metadata_present: Value<Fp>,
}

impl Circuit<Fp> for Rec16Circuit {
    type Config = Rec16Config;
    type FloorPlanner = SimpleFloorPlanner;

    fn without_witnesses(&self) -> Self {
        Self {
            metadata_present: Value::unknown(),
        }
    }

    fn configure(meta: &mut ConstraintSystem<Fp>) -> Self::Config {
        let advice = meta.advice_column();
        let instance = meta.instance_column();

        meta.enable_equality(advice);
        meta.enable_equality(instance);

        meta.create_gate("rec16 metadata_present equals public instance", |meta| {
            let a = meta.query_advice(advice, Rotation::cur());
            let i = meta.query_instance(instance, Rotation::cur());
            vec![a - i]
        });

        Rec16Config { advice, instance }
    }

    fn synthesize(
        &self,
        config: Self::Config,
        mut layouter: impl Layouter<Fp>,
    ) -> Result<(), Error> {
        layouter.assign_region(
            || "rec16 region",
            |mut region| {
                region.assign_advice(
                    || "rec16 metadata_present",
                    config.advice,
                    0,
                    || self.metadata_present,
                )?;
                Ok(())
            },
        )?;

        Ok(())
    }
}